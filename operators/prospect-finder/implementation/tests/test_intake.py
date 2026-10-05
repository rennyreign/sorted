"""
Intake quality tests — dedup merge, intake scoring, and the lead-authored
GET/PATCH/POST storage flow. All HTTP is mocked; nothing hits Supabase.
"""

import os
import sys
import unittest
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "test-key")

from scraper.filters import (  # noqa: E402
    compute_intake,
    controlled_intake_category,
    dedup_records,
    merge_records,
)
from storage.supabase import upsert_prospects  # noqa: E402


def _record(**overrides):
    rec = {
        "place_id": "PLACE1",
        "name": "Acme Builders",
        "category": "builder",
        "address": "1 High St",
        "city": "London",
        "postcode": "E1 1AA",
        "phone": None,
        "website": "https://acme.example.com",
        "email": "hi@acme.example.com",
        "website_exists": True,
        "email_exists": True,
        "qualified": True,
        "rating": 4.6,
        "review_count": 120,
        "google_maps_url": "https://maps.example.com/1",
        "latitude": 51.5,
        "longitude": -0.1,
        "search_query": "builder",
        "search_location": "London, UK",
        "run_id": "run-one",
        "status": "prospect",
    }
    rec.update(compute_intake(
        rec["search_query"], rec["rating"], rec["review_count"],
        rec["email"], rec["phone"], rec["website"],
    ))
    rec.update(overrides)
    return rec


def _resp(status=200, json_data=None, text=""):
    r = MagicMock()
    r.status_code = status
    r.ok = status < 400
    r.json.return_value = json_data if json_data is not None else []
    r.text = text
    return r


class TestIntakeScoring(unittest.TestCase):
    def test_rating_review_tiers(self):
        self.assertEqual(compute_intake("builder", 4.5, 100, "a@b.c", None, None)["intake_signals"]["rating_reviews_points"], 4)
        self.assertEqual(compute_intake("builder", 4.2, 50, "a@b.c", None, None)["intake_signals"]["rating_reviews_points"], 3)
        self.assertEqual(compute_intake("builder", 4.1, 10, "a@b.c", None, None)["intake_signals"]["rating_reviews_points"], 2)
        # rating missing entirely, reviews >= 20 → 1
        self.assertEqual(compute_intake("builder", None, 30, "a@b.c", None, None)["intake_signals"]["rating_reviews_points"], 1)
        self.assertEqual(compute_intake("builder", None, None, "a@b.c", None, None)["intake_signals"]["rating_reviews_points"], 0)
        # supplied-but-invalid rating/review_count → 0 (only missing rating earns the 1pt tier)
        self.assertEqual(compute_intake("builder", -1, 200, "a@b.c", None, None)["intake_signals"]["rating_reviews_points"], 0)
        self.assertEqual(compute_intake("builder", 4.9, -5, "a@b.c", None, None)["intake_signals"]["rating_reviews_points"], 0)
        self.assertEqual(compute_intake("builder", "4.5", "100", "a@b.c", None, None)["intake_signals"]["rating_reviews_points"], 0)
        self.assertEqual(compute_intake("builder", 3.9, 50, "a@b.c", None, None)["intake_signals"]["rating_reviews_points"], 0)

    def test_category_contact_website_points(self):
        s = compute_intake(" builder ", 4.5, 100, "a@b.c", None, "https://x.com")
        self.assertEqual(s["intake_category"], "builder")
        self.assertEqual(s["intake_signals"]["category_points"], 3)
        self.assertEqual(s["intake_signals"]["contact_points"], 2)
        self.assertEqual(s["intake_signals"]["website_points"], 1)
        self.assertEqual(s["intake_priority"], 10)
        self.assertEqual(s["intake_signals"]["basis"], "google_maps_only")
        self.assertEqual(s["intake_signals"]["version"], 1)

        adhoc = compute_intake("dog groomer", None, None, None, None, None)
        self.assertEqual(adhoc["intake_category"], "other")
        self.assertEqual(adhoc["intake_priority"], 0)

        # blank contacts are not contactable; placeholder-free website only
        no_contact = compute_intake("builder", None, None, "  ", "", None)
        self.assertEqual(no_contact["intake_signals"]["contact_points"], 0)
        self.assertEqual(no_contact["intake_signals"]["website_points"], 0)

    def test_controlled_category(self):
        self.assertEqual(controlled_intake_category(" Roofer "), "roofer")
        self.assertEqual(controlled_intake_category("Piano Mover"), "other")


class TestDedup(unittest.TestCase):
    def test_merge_complementary_fields(self):
        a = _record(email=None, website=None, website_exists=False, email_exists=False,
                    qualified=False, review_count=10)
        b = _record(email="x@y.z", website="https://w.com",
                    review_count=5, rating=3.0)
        merged = merge_records(a, b)
        self.assertEqual(merged["email"], "x@y.z")
        self.assertEqual(merged["website"], "https://w.com")
        # rating/review pair from greatest review_count (base has 10 > 5)
        self.assertEqual(merged["review_count"], 10)
        self.assertEqual(merged["rating"], 4.6)
        self.assertTrue(merged["qualified"])
        # provenance preserved from first record
        self.assertEqual(merged["run_id"], "run-one")
        self.assertEqual(merged["search_query"], "builder")

    def test_rating_pair_from_greatest_review_count(self):
        a = _record(rating=4.9, review_count=3)
        b = _record(rating=4.0, review_count=50)
        merged = merge_records(a, b)
        self.assertEqual(merged["rating"], 4.0)
        self.assertEqual(merged["review_count"], 50)

    def test_dedup_across_query_batches(self):
        a = _record(search_query="builder", email=None, email_exists=False,
                    qualified=False, website="https://w.com")
        b = _record(search_query="roofer", email="x@y.z")
        out = dedup_records([a, b])
        self.assertEqual(len(out), 1)
        self.assertEqual(out[0]["search_query"], "builder")
        self.assertEqual(out[0]["email"], "x@y.z")

    def test_distinct_place_ids_kept(self):
        a = _record(place_id="AAA")
        b = _record(place_id="BBB")  # same name + postcode, different place_id
        out = dedup_records([a, b])
        self.assertEqual({r["place_id"] for r in out}, {"AAA", "BBB"})


class TestStorage(unittest.TestCase):
    @patch("storage.supabase.requests.post")
    @patch("storage.supabase.requests.get")
    def test_new_records_posted_no_merge_duplicates(self, mock_get, mock_post):
        mock_get.return_value = _resp(200, [])
        mock_post.return_value = _resp(201)
        stored, errors = upsert_prospects([_record()])
        self.assertEqual((stored, errors), (1, 0))
        params = mock_get.call_args.kwargs["params"]
        self.assertEqual(params["place_id"], "in.(PLACE1)")
        self.assertEqual(params["limit"], "50")
        post_headers = mock_post.call_args.kwargs["headers"]
        self.assertEqual(post_headers["Prefer"], "return=minimal")
        self.assertNotIn("merge-duplicates", post_headers["Prefer"])
        self.assertNotIn("on_conflict", mock_post.call_args.kwargs.get("params") or {})

    @patch("storage.supabase.requests.patch")
    @patch("storage.supabase.requests.post")
    @patch("storage.supabase.requests.get")
    def test_existing_row_protection(self, mock_get, mock_post, mock_patch):
        existing = {
            "id": 42, "place_id": "PLACE1", "name": "Acme", "category": "builder",
            "email": "manual@enriched.com",  # manually enriched — keep it
            "phone": None, "website": "https://old.com",
            "address": None, "city": None, "postcode": None,
            "rating": None, "review_count": None,
            "google_maps_url": None, "latitude": None, "longitude": None,
            "search_query": "builder", "search_location": "London, UK",
            "website_exists": True, "email_exists": True, "qualified": True,
            "intake_category": "builder", "intake_priority": 10,
            "intake_signals": {"version": 1},
            "outreach_status": None, "review_slug": None,
            "mockup_url": None, "mockup_urls": None,
            "status": "contacted", "run_id": "old-run",
            "first_seen_at": "2025-01-01",
        }
        mock_get.return_value = _resp(200, [existing])
        mock_patch.return_value = _resp(204)
        stored, errors = upsert_prospects([_record()])
        self.assertEqual((stored, errors), (1, 0))
        mock_post.assert_not_called()
        self.assertEqual(mock_patch.call_args.kwargs["params"], {"id": "eq.42"})
        body = mock_patch.call_args.kwargs["json"]
        # whitelisted fills + rating pair (120 > null) — enriched email/website untouched
        self.assertNotIn("email", body)
        self.assertNotIn("website", body)
        self.assertNotIn("phone", body)  # existing value None, record phone empty
        self.assertNotIn("status", body)
        self.assertNotIn("crm_status", body)
        self.assertNotIn("run_id", body)
        self.assertNotIn("first_seen_at", body)
        self.assertNotIn("analysed_at", body)
        # new review_count strictly greater than old (None) → pair updated
        self.assertEqual(body["review_count"], 120)
        self.assertEqual(body["rating"], 4.6)

    @patch("storage.supabase.requests.get")
    def test_get_select_covers_patchable_and_trigger_fields(self, mock_get):
        mock_get.return_value = _resp(200, [])
        with patch("storage.supabase.requests.post", return_value=_resp(201)):
            upsert_prospects([_record()])
        select = mock_get.call_args.kwargs["params"]["select"].split(",")
        for col in (
            "id", "place_id", "name", "category", "address", "city", "postcode",
            "email", "phone", "website", "rating", "review_count",
            "google_maps_url", "latitude", "longitude",
            "search_query", "search_location",
            "website_exists", "email_exists", "qualified",
            "intake_category", "intake_priority", "intake_signals",
            # check_outreach_eligibility trigger preconditions
            "outreach_status", "review_slug", "mockup_url", "mockup_urls",
        ):
            self.assertIn(col, select)

    def _existing_full(self, rec, **overrides):
        from storage.supabase import PATCHABLE_FIELDS
        existing = {f: rec.get(f) for f in PATCHABLE_FIELDS}
        existing.update({
            "id": 7, "place_id": rec["place_id"], "status": "prospect",
            "run_id": "r", "first_seen_at": "t",
            "outreach_status": None, "review_slug": None,
            "mockup_url": None, "mockup_urls": None,
        })
        existing.update(overrides)
        return existing

    @patch("storage.supabase.requests.patch")
    @patch("storage.supabase.requests.get")
    def test_no_change_skips_patch(self, mock_get, mock_patch):
        rec = _record()
        existing = self._existing_full(rec)
        # strip intake keys so the PATCH body would be empty → no write at all
        bare = {k: v for k, v in rec.items() if not k.startswith("intake_")}
        with patch("storage.supabase.requests.post") as mock_post:
            mock_get.return_value = _resp(200, [existing])
            upsert_prospects([bare])
            mock_post.assert_not_called()
            mock_patch.assert_not_called()

    @patch("storage.supabase.requests.patch")
    @patch("storage.supabase.requests.get")
    def test_unchanged_intake_not_patched(self, mock_get, mock_patch):
        rec = _record()
        existing = self._existing_full(rec)  # same values incl. intake
        mock_get.return_value = _resp(200, [existing])
        mock_patch.return_value = _resp(204)
        stored, errors = upsert_prospects([rec])
        self.assertEqual(errors, 0)
        if mock_patch.called:
            body = mock_patch.call_args.kwargs["json"]
            self.assertNotIn("intake_priority", body)
            self.assertNotIn("intake_category", body)
            self.assertNotIn("intake_signals", body)
        else:
            self.assertEqual(stored, 0)

    @patch("storage.supabase.requests.patch")
    @patch("storage.supabase.requests.get")
    def test_richer_existing_contacts_prevent_rank_downgrade(self, mock_get, mock_patch):
        # existing row has email+website+strong reviews; fresh record is weaker
        rec = _record(email=None, website=None, email_exists=False,
                      website_exists=False, qualified=False,
                      rating=None, review_count=None)
        existing = self._existing_full(
            rec, email="e@x.com", website="https://good.com",
            rating=4.8, review_count=150,
        )
        existing["intake_priority"] = 10
        mock_get.return_value = _resp(200, [existing])
        mock_patch.return_value = _resp(204)
        upsert_prospects([rec])
        if mock_patch.called:
            body = mock_patch.call_args.kwargs["json"]
            # intake must be computed from merged (existing) values → stays 10
            self.assertTrue(
                "intake_priority" not in body or body["intake_priority"] == 10
            )
            self.assertNotIn("rating", body)
            self.assertNotIn("review_count", body)

    @patch("storage.supabase.requests.patch")
    @patch("storage.supabase.requests.get")
    def test_auto_ready_risk_skips_patch_as_error(self, mock_get, mock_patch):
        rec = _record()
        # email + review_slug + mockup present, body nonempty (address fill)
        # → any UPDATE could auto-mark READY while outreach_status is null
        existing = self._existing_full(
            rec, review_slug="acme-builders", mockup_url="m.png", address=None,
        )
        mock_get.return_value = _resp(200, [existing])
        stored, errors = upsert_prospects([rec])
        self.assertEqual((stored, errors), (0, 1))
        mock_patch.assert_not_called()

    @patch("storage.supabase.requests.patch")
    @patch("storage.supabase.requests.get")
    def test_auto_ready_risk_via_filled_email(self, mock_get, mock_patch):
        # existing has review_slug+mockup but no email; record would fill it
        rec = _record()
        existing = self._existing_full(
            rec, email=None, review_slug="acme", mockup_urls=["m.png"],
        )
        mock_get.return_value = _resp(200, [existing])
        stored, errors = upsert_prospects([rec])
        self.assertEqual((stored, errors), (0, 1))
        mock_patch.assert_not_called()

    @patch("storage.supabase.requests.patch")
    @patch("storage.supabase.requests.get")
    def test_noop_on_risky_row_is_not_error(self, mock_get, mock_patch):
        # risky row but nothing to change → silent skip, no warning/error
        rec = _record()
        existing = self._existing_full(
            rec, review_slug="acme-builders", mockup_url="m.png",
        )
        mock_get.return_value = _resp(200, [existing])
        stored, errors = upsert_prospects([rec])
        self.assertEqual((stored, errors), (0, 0))
        mock_patch.assert_not_called()

    @patch("storage.supabase.requests.patch")
    @patch("storage.supabase.requests.get")
    def test_sent_outreach_status_patches_safely(self, mock_get, mock_patch):
        # SENT/READY/etc → trigger won't auto-READY; patch is safe
        rec = _record()
        existing = self._existing_full(
            rec, review_slug="acme-builders", mockup_url="m.png",
            outreach_status="SENT", address=None,
        )
        mock_get.return_value = _resp(200, [existing])
        mock_patch.return_value = _resp(204)
        stored, errors = upsert_prospects([rec])
        self.assertEqual((stored, errors), (1, 0))
        mock_patch.assert_called_once()
        self.assertEqual(mock_patch.call_args.kwargs["json"]["address"], "1 High St")

    @patch("storage.supabase.requests.patch")
    @patch("storage.supabase.requests.post")
    @patch("storage.supabase.requests.get")
    def test_get_failure_aborts_batch(self, mock_get, mock_post, mock_patch):
        mock_get.return_value = _resp(500, text="boom")
        stored, errors = upsert_prospects([_record()])
        self.assertEqual((stored, errors), (0, 1))
        mock_post.assert_not_called()
        mock_patch.assert_not_called()

    @patch("storage.supabase.requests.post")
    @patch("storage.supabase.requests.get")
    def test_invalid_place_id_aborts_write(self, mock_get, mock_post):
        rec = _record(place_id="bad;id")
        stored, errors = upsert_prospects([rec])
        self.assertEqual((stored, errors), (0, 1))
        mock_get.assert_not_called()
        mock_post.assert_not_called()

    @patch("storage.supabase.requests.post")
    @patch("storage.supabase.requests.get")
    def test_unique_conflict_is_error_not_overwritten(self, mock_get, mock_post):
        mock_get.return_value = _resp(200, [])
        mock_post.return_value = _resp(409, text="duplicate key")
        stored, errors = upsert_prospects([_record()])
        self.assertEqual((stored, errors), (0, 1))


if __name__ == "__main__":
    unittest.main()
