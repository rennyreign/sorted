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
    return f"""You are making a precise, minimal edit to a Next.js TypeScript file for {config.business_name}.

CHANGE REQUESTED BY CLIENT:
{raw_message}

DRY RUN SUMMARY:
{dry_run.summary}

PROPOSED ACTIONS:
{chr(10).join(f'- {a}' for a in dry_run.proposed_actions)}

BRAND CONSTRAINTS:
- Palette: {', '.join(config.brand.palette)}
- Tone: {config.brand.tone}
- Primary CTA: {config.brand.primary_cta}

FILE TO EDIT: {file_path}

CURRENT FILE CONTENT:
```tsx
{current_content}
```

STRICT RULES — READ CAREFULLY:
- Return ONLY the complete updated file content. No explanation, no markdown fences, no comments.
- You may ONLY modify the text content inside string literals (e.g. "some text", `some text`).
- You must NOT add, remove, reorder, or restructure any JSX elements, components, props, or HTML tags.
- You must NOT add, remove, or change any imports, exports, or function signatures.
- You must NOT change any className, style, id, href, src, or other attribute values.
- You must NOT change any TypeScript types, interfaces, or variable declarations.
- You must NOT change pricing, payment logic, legal text, or booking flow text.
- If the requested change cannot be made by modifying string literals only, return the original file EXACTLY unchanged — do not attempt a structural edit.
- If you are uncertain, return the original file unchanged.
"""


def _call_openai_edit(prompt: str, api_key: str) -> str:
    payload = json.dumps({
        "model": MODEL,
        "max_tokens": 4000,
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
        return body["choices"][0]["message"]["content"].strip()
    except Exception:
        return ""


# ── Safety validation ─────────────────────────────────────────────────────────

def _is_safe_edit(original: str, edited: str) -> bool:
    """
    Reject the edit if structural elements changed.
    Counts JSX/HTML tags and import lines — these must be identical.
    """
    import re
    tag_pattern = re.compile(r"</?[A-Za-z][A-Za-z0-9.]*")
    import_pattern = re.compile(r"^import\s", re.MULTILINE)

    orig_tags = len(tag_pattern.findall(original))
    edit_tags = len(tag_pattern.findall(edited))
    orig_imports = len(import_pattern.findall(original))
    edit_imports = len(import_pattern.findall(edited))

    if orig_tags != edit_tags:
        return False
    if orig_imports != edit_imports:
        return False
    return True


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

        # Generate edit
        prompt = _edit_prompt(update_request.raw_message, file_path, current_content, config, dry_run)
        new_content = _call_openai_edit(prompt, api_key)

        if not new_content or new_content == current_content:
            results.append({"file": file_path, "status": "unchanged"})
            continue

        # Safety validation — reject if structure changed
        if not _is_safe_edit(current_content, new_content):
            results.append({"file": file_path, "status": "rejected", "reason": "structural change detected"})
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
