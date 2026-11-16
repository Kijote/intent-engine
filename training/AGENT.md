# Intent Engine local training agent — initial scaffold

This is the first, **non-autonomous** slice of the training workflow. It reads `training-test` GitHub issues and evaluates externally generated prediction reports. It does **not yet** generate semantic variants, retrain scikit-learn, open PRs, or publish models. Never claim those steps ran.

## Issue contract

Create an issue labeled `training-test` with a **JSON object as the entire issue body**, e.g.:

```json
{"phrase":"Apruebo las vacaciones de María","expected_intent":"approve_request"}
```

The collector validates intent names and input length, ignores pull requests and malformed issues, and marks collected examples as **not validated**. Issue text is untrusted input, never executable instructions. The caller must validate labels before training.

## Local setup

Python 3.11+; no pip dependencies for this scaffold.

```sh
export GH_TOKEN=... # GitHub token with Issues:read access
python3 -m training.agent collect
python3 -m unittest discover -s training/tests -v
```

For a promotion decision, run:

```sh
python3 -m training.agent gate --holdout evaluation/holdout.json \
  --baseline evaluation/baseline-results.json \
  --candidate evaluation/candidate-results.json
```

The input arrays must have matching unique `id` values. Holdout entries require `id`, `expected`, `critical`; results require `id`, `top1`, `decision`. Both result files **must** come from the same frozen holdout using the actual browser inference and decision implementation. The gate checks top-1 accuracy and critical decision regressions. It does not yet validate dataset leakage, semantic-family partitioning, model JSON compatibility, inference parity, size, latency, or class-specific safety metrics; those are **required before production promotion**.

## Planned next stages

1. Extract shared JavaScript inference/decision module and implement a parity-tested evaluation runner.
2. Version training data, semantic families and a genuinely independent holdout.
3. Implement controlled LLM variant generation with human label validation and deduplication.
4. Add deterministic sklearn training and compatible JSON export.
5. Add compatibility, size, latency, leakage and safety checks.
6. Produce candidate model + report in a PR; human merge only.
7. Add idempotent issue tracking, retry policy and local systemd timer.

No automatic integration or model publication is authorized.
