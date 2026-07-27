# Sorted Git and Pull Request Workflow

This is the safe path for making a change to Sorted without accidentally publishing unfinished work or consuming unnecessary deployment credits.

## The three places your work lives

### `main`

`main` is the production branch. Changes merged here are the approved version of the project and can trigger live deployment workflows.

Treat it as stable:

- Do not experiment directly on `main`.
- Do not push a partial build to `main`.
- Merge only reviewed, tested pull requests.

### `feat/...` or `fix/...` branch

A branch is your private work lane. Create one before changing code:

```bash
git checkout -b feat/descriptive-name
```

Use `feat/` for new capabilities and `fix/` for repairs. Examples:

```bash
git checkout -b feat/new-prospect-filter
git checkout -b fix/outreach-owner-email
```

You can safely make, test, and revise changes on this branch without changing production.

### Pull request (PR)

A PR is the review and merge request from your branch into `main`.

It shows exactly what will change, gives tests a place to run, and creates a clear record of why the change was made. A PR is not production until it is merged.

## Normal workflow

### 1. Start from current `main`

Before new work, make sure your branch starts from the latest approved code:

```bash
git checkout main
git pull
git checkout -b feat/short-description
```

If you already have unrelated work in progress, do not switch branches over it. Finish it, commit it, or ask for help isolating the change first.

### 2. Make one focused change

Keep a branch focused on one outcome. For example, the owner-email outreach fix belongs on `fix/outreach-owner-email`, not in a larger unrelated feature branch.

This makes PR review safer and makes it easier to revert one change if needed.

### 3. Test before committing

Run the smallest relevant test first, then any broader checks required by the project:

```bash
python3 operators/outreach-sender/implementation/test_send.py
npm run build
```

Only use commands relevant to the code you changed. A passing test should prove the intended behaviour, not merely that the command completes.

### 4. Inspect what will be committed

Always review the changes before staging:

```bash
git status
git diff
```

Stage only the intended files:

```bash
git add path/to/changed-file
```

Avoid `git add .` when other work is present.

### 5. Commit the change

A commit is a saved, named checkpoint on your branch. Use a short message that describes the user-facing reason for the change:

```bash
git commit -m "fix: send outreach to enriched owner emails"
```

Commits do not make a change live. They only save it locally until pushed and merged.

### 6. Push the branch and open a PR

```bash
git push -u origin fix/outreach-owner-email
gh pr create --base main --title "fix: send outreach to enriched owner emails"
```

Before merging, check the PR diff contains only the intended files and that its checks have passed.

### 7. Merge the PR into `main`

After review and passing checks, merge the PR. This is the point where the change becomes part of production source control.

```bash
gh pr merge --merge --delete-branch
```

Never force-push or merge unfinished work just to get it live quickly. If a live fix is urgent, create a small focused `fix/...` branch and PR rather than mixing it with other work.

### 8. Confirm the live system picked it up

A merge updates source control; it does not prove a scheduled job has run successfully.

For scheduled operators:

1. Confirm the commit is on `main`.
2. Check the deployment or GitHub Actions run that uses `main`.
3. Check the live database or operator logs for the expected behaviour.
4. For anything that sends customer-facing email, verify the first live result before assuming the queue is clear.

## How this applies to outreach

The outreach sender workflow checks out `main` each time it runs. A fix can be complete and tested on a feature branch but will not affect actual sends until its PR is merged to `main`.

For a live outreach change, the safe sequence is:

```text
fix branch → tests → focused PR → merge to main → next scheduled sender run → verify result
```

The sender runs during its configured business-hours window and processes eligible prospects oldest first. A successful GitHub Actions run can still send zero messages if no prospect satisfies all recipient and review requirements.

## Quick glossary

| Term | Meaning |
| --- | --- |
| Working tree | Your currently edited files, including uncommitted changes. |
| Branch | An isolated line of work, such as `feat/...` or `fix/...`. |
| Commit | A saved checkpoint containing selected changes. |
| Push | Uploading commits from your computer to GitHub. |
| PR | A proposed merge from one branch into another, usually into `main`. |
| Merge | Adding the approved PR commits to `main`. |
| `main` | The approved production source branch. |
| Deploy | Updating the live service from the production source; it may happen automatically after merge. |
