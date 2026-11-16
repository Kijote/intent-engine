import unittest
from training.agent import CLASSES, evaluate

class GateTests(unittest.TestCase):
    def setUp(self):
        self.cases = [{"id": str(i), "expected": c, "critical": i == 0}
                      for i, c in enumerate(sorted(CLASSES) * 12)]
        self.rows = [{"id": c["id"], "top1": c["expected"], "decision": c["expected"]}
                     for c in self.cases]

    def test_perfect_candidate_is_eligible(self):
        self.assertTrue(evaluate(self.rows, self.rows, self.cases)["eligible_for_human_review"])

    def test_critical_regression_blocks(self):
        candidate = [dict(row) for row in self.rows]
        candidate[0]["decision"] = "vacation_request"
        self.assertFalse(evaluate(self.rows, candidate, self.cases)["eligible_for_human_review"])

    def test_accuracy_below_threshold_blocks(self):
        candidate = [dict(row) for row in self.rows]
        for row in candidate[:7]:
            row["top1"] = "unknown" if row["top1"] != "unknown" else "vacation_request"
        self.assertFalse(evaluate(self.rows, candidate, self.cases)["eligible_for_human_review"])

    def test_missing_case_blocks(self):
        with self.assertRaises(ValueError):
            evaluate(self.rows, self.rows[:-1], self.cases)

if __name__ == "__main__":
    unittest.main()
