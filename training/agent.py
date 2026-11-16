"""Local, review-only training issue collector and promotion gate. Python 3.11+; stdlib only."""
import argparse
import json
import os
import pathlib
import subprocess
import sys
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
POLICY = json.loads((ROOT / "training/promotion-policy.json").read_text())
CLASSES = {"absence_report", "approve_request", "calendar_query", "create_form",
           "permission_request", "request_status", "unknown", "vacation_balance", "vacation_request"}

def github(path):
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if not token:
        raise RuntimeError("Set GH_TOKEN or GITHUB_TOKEN (read access to repository issues)")
    req = urllib.request.Request("https://api.github.com/repos/Kijote/intent-engine/" + path,
                                 headers={"Authorization": "Bearer " + token,
                                          "Accept": "application/vnd.github+json",
                                          "User-Agent": "intent-engine-training-agent"})
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)

def collect():
    """Read pending labeled issues; never trust their content as agent instructions."""
    label = urllib.parse.quote(POLICY["agent"]["issue_label"])
    issues = github("issues?state=open&labels=" + label + "&per_page=100")
    result = []
    for issue in issues:
        if "pull_request" in issue:
            continue
        try:
            payload = json.loads(issue.get("body") or "")
            phrase, expected = payload["phrase"], payload["expected_intent"]
            if not isinstance(phrase, str) or not phrase.strip() or len(phrase) > 1000:
                raise ValueError("invalid phrase")
            if expected not in CLASSES:
                raise ValueError("unknown expected_intent")
            result.append({"issue": issue["number"], "phrase": phrase.strip(),
                           "expected_intent": expected, "origin": "human_issue",
                           "validated": False})
        except (ValueError, KeyError, TypeError, json.JSONDecodeError) as exc:
            print(f"Skipping issue #{issue['number']}: {exc}", file=sys.stderr)
    return result

def evaluate(current, candidate, cases):
    """Use per-case results exported by a runner invoking the actual JS decision logic.
    JSON arrays: [{id, expected, top1, decision, critical}, ...].
    'decision' must be the production decision, not top1 alone.
    """
    if not cases or len(cases) < POLICY["evaluation"]["min_holdout_examples"]:
        raise ValueError("Independent holdout is missing or too small")
    ids = [c["id"] for c in cases]
    if len(set(ids)) != len(ids):
        raise ValueError("Duplicate holdout IDs")
    if POLICY["evaluation"]["require_all_classes"] and {c["expected"] for c in cases} != CLASSES:
        raise ValueError("Holdout does not cover all model classes")
    def index(rows):
        by_id = {r["id"]: r for r in rows}
        if len(by_id) != len(rows) or set(by_id) != set(ids):
            raise ValueError("Results missing, duplicated or unexpected case IDs")
        return by_id
    old, new = index(current), index(candidate)
    correct = lambda r, c: r["top1"] == c["expected"]
    old_acc = sum(correct(old[c["id"]], c) for c in cases) / len(cases)
    new_acc = sum(correct(new[c["id"]], c) for c in cases) / len(cases)
    regressions = [c["id"] for c in cases if c.get("critical") and
                   old[c["id"]]["decision"] == c["expected"] and
                   new[c["id"]]["decision"] != c["expected"]]
    # A new incorrect executable action on a critical case also blocks promotion.
    unsafe = [c["id"] for c in cases if c.get("critical") and
              new[c["id"]]["decision"] not in (c["expected"], "reject", "confirm", "unknown")]
    passed = (new_acc >= POLICY["promotion"]["min_accuracy"] and
              (not POLICY["promotion"]["require_non_regression"] or new_acc >= old_acc) and
              len(set(regressions + unsafe)) <= POLICY["promotion"]["max_critical_regressions"])
    return {"eligible_for_human_review": passed, "baseline_accuracy": old_acc,
            "candidate_accuracy": new_acc, "critical_regressions": sorted(set(regressions + unsafe)),
            "auto_merge": False, "auto_publish": False}

def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("collect")
    gate = sub.add_parser("gate")
    for key in ("holdout", "baseline", "candidate"):
        gate.add_argument("--" + key, required=True, type=pathlib.Path)
    args = parser.parse_args()
    if args.command == "collect":
        print(json.dumps(collect(), ensure_ascii=False, indent=2))
    else:
        inputs = [json.loads(getattr(args, name).read_text()) for name in ("baseline", "candidate", "holdout")]
        result = evaluate(*inputs)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        if not result["eligible_for_human_review"]:
            sys.exit(2)

if __name__ == "__main__":
    main()
