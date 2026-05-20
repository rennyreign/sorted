"""
writer.py — generates file edits for a preview branch using GPT-4o mini
and commits them to GitHub via the Contents API.
"""
from __future__ import annotations

import base64
import json
import os
import urllib.error
import urllib.request
from typing import Any

from models import ClientOperatorConfig, DryRunPlan, UpdateRequest


OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
MODEL = "gpt-4o-mini"


# ── GitHub helpers ────────────────────────────────────────────────────────────

def _github_api(method: str, path: str, body: dict | None = None) -> dict:
    token = os.getenv("GITHUB_TOKEN", "")
    url = f"https://api.github.com{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url, data=data, method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return {"error": e.code, "message": e.read().decode()}


def _get_file(repo: str, path: str, branch: str) -> tuple[str, str] | None:
    """Returns (content_str, sha) or None if not found."""
    data = _github_api("GET", f"/repos/{repo}/contents/{path}?ref={branch}")
    if "error" in data or "content" not in data:
        return None
    content = base64.b64decode(data["content"]).decode("utf-8")
    return content, data["sha"]


def _put_file(repo: str, path: str, branch: str, content: str, sha: str | None, message: str) -> dict:
    """Create or update a file on a branch."""
    encoded = base64.b64encode(content.encode("utf-8")).decode("ascii")
    body: dict[str, Any] = {
        "message": message,
        "content": encoded,
        "branch": branch,
    }
    if sha:
        body["sha"] = sha
    return _github_api("PUT", f"/repos/{repo}/contents/{path}", body)


# ── LLM edit generation ───────────────────────────────────────────────────────

def _edit_prompt(
    raw_message: str,
    file_path: str,
    current_content: str,
    config: ClientOperatorConfig,
    dry_run: DryRunPlan,
) -> str:
    return f"""You are making a precise, minimal text edit to a Next.js TypeScript file for {config.business_name}.

CHANGE REQUESTED BY CLIENT:
{raw_message}

FILE: {file_path}

CURRENT FILE CONTENT:
```tsx
{current_content}
```

Your task: identify the EXACT string(s) that need changing and return ONLY a JSON array of find/replace pairs.

Rules:
- You may ONLY change text inside string literals or template literals.
- Do NOT change JSX tags, props, classNames, imports, or TypeScript types.
- Return ONLY valid JSON — an array of objects with "find" and "replace" keys.
- Each "find" value must be an EXACT substring from the file above (copy it precisely).
- If no change is needed or possible, return an empty array: []

Example output format:
[{{"find": "old text here", "replace": "new text here"}}]
"""


def _call_openai_patch(prompt: str, api_key: str) -> list[dict]:
    """Call GPT and return a list of {find, replace} patch dicts."""
    payload = json.dumps({
        "model": MODEL,
        "max_tokens": 1000,
        "temperature": 0.1,
        "messages": [{"role": "user", "content": prompt}],
    }).encode("utf-8")

    req = urllib.request.Request(
        OPENAI_API_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode("utf-8"))
        raw = body["choices"][0]["message"]["content"].strip()
        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        patches = json.loads(raw)
        if isinstance(patches, list):
            return patches
        return []
    except Exception:
        return []


# ── Safety validation ─────────────────────────────────────────────────────────

def _apply_patches(content: str, patches: list[dict]) -> tuple[str, int]:
    """
    Apply find/replace patches to content.
    Returns (updated_content, number_of_replacements_made).
    """
    result = content
    count = 0
    for patch in patches:
        find = patch.get("find", "")
        replace = patch.get("replace", "")
        if find and find in result:
            result = result.replace(find, replace, 1)
            count += 1
    return result, count


# ── Public entry point ────────────────────────────────────────────────────────

def write_preview_edits(
    update_request: UpdateRequest,
    dry_run: DryRunPlan,
    config: ClientOperatorConfig,
    branch_name: str,
) -> dict:
    """
    For each target file in the dry run, fetch current content from GitHub,
    use GPT-4o mini to generate the edit, and commit it to the preview branch.
    Returns a summary dict.
    """
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        return {"status": "skipped", "reason": "no OPENAI_API_KEY"}

    repo = config.repo
    results = []

    for file_path in dry_run.target_files:
        # Fetch current content from the branch (falls back to main if branch is fresh)
        fetched = _get_file(repo, file_path, branch_name)
        if fetched is None:
            fetched = _get_file(repo, file_path, "main")
        if fetched is None:
            results.append({"file": file_path, "status": "not_found"})
            continue

        current_content, sha = fetched

        # Generate patch
        prompt = _edit_prompt(update_request.raw_message, file_path, current_content, config, dry_run)
        patches = _call_openai_patch(prompt, api_key)

        if not patches:
            results.append({"file": file_path, "status": "unchanged", "reason": "no patches returned"})
            continue

        new_content, replacements = _apply_patches(current_content, patches)

        if replacements == 0 or new_content == current_content:
            results.append({"file": file_path, "status": "unchanged", "reason": "patches did not match", "patches": patches})
            continue

        # Commit to branch
        commit_result = _put_file(
            repo, file_path, branch_name, new_content, sha,
            message=f"sorted: {dry_run.summary[:72]}",
        )

        if "error" in commit_result:
            results.append({"file": file_path, "status": "error", "detail": commit_result})
        else:
            results.append({"file": file_path, "status": "committed", "sha": commit_result.get("content", {}).get("sha")})

    return {
        "status": "edits_written" if any(r["status"] == "committed" for r in results) else "no_changes",
        "files": results,
    }
