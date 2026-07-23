"""
Tests for Email Enricher operator — Hunter.io integration.

Tests the email selection logic, domain extraction, and name splitting
without making real API calls.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from main import (
    select_best_email_from_domain_search,
    extract_domain,
    split_name,
    is_owner_title,
)


# ─── extract_domain ───────────────────────────────────────────────────────────

def test_extract_domain_from_url():
    assert extract_domain("https://forrestcoffeehouse.co.uk") == "forrestcoffeehouse.co.uk"

def test_extract_domain_from_www_url():
    assert extract_domain("http://www.example.com/page") == "example.com"

def test_extract_domain_from_bare_domain():
    assert extract_domain("example.com") == "example.com"

def test_extract_domain_from_none():
    assert extract_domain(None) is None

def test_extract_domain_from_empty():
    assert extract_domain("") is None

def test_extract_domain_from_path_only():
    assert extract_domain("/about") is None

def test_extract_domain_social_media():
    assert extract_domain("https://instagram.com/fancybarber") is None

def test_extract_domain_booksy():
    assert extract_domain("https://standrd.booksy.com/a/") is None

def test_extract_domain_facebook():
    assert extract_domain("https://facebook.com/business") is None


# ─── split_name ───────────────────────────────────────────────────────────────

def test_split_name_full():
    first, last = split_name("Sarah Smith")
    assert first == "Sarah"
    assert last == "Smith"

def test_split_name_middle():
    first, last = split_name("John David Brown")
    assert first == "John"
    assert last == "Brown"

def test_split_name_single():
    first, last = split_name("Renaldo")
    assert first == "Renaldo"
    assert last is None

def test_split_name_none():
    first, last = split_name(None)
    assert first is None
    assert last is None

def test_split_name_empty():
    first, last = split_name("")
    assert first is None
    assert last is None


# ─── is_owner_title ───────────────────────────────────────────────────────────

def test_owner_title_owner():
    assert is_owner_title("Owner") is True

def test_owner_title_founder():
    assert is_owner_title("Founder and CEO") is True

def test_owner_title_director():
    assert is_owner_title("Managing Director") is True

def test_owner_title_employee():
    assert is_owner_title("Barista") is False

def test_owner_title_none():
    assert is_owner_title(None) is False

def test_owner_title_empty():
    assert is_owner_title("") is False


# ─── select_best_email_from_domain_search ─────────────────────────────────────

def test_select_email_by_owner_name_match():
    emails = [
        {"value": "info@business.co.uk", "type": "generic", "confidence": 80, "first_name": None, "last_name": None, "position": None},
        {"value": "sarah@business.co.uk", "type": "personal", "confidence": 90, "first_name": "Sarah", "last_name": "Smith", "position": "Owner"},
    ]
    email, conf, pos = select_best_email_from_domain_search(emails, owner_name="Sarah Smith")
    assert email == "sarah@business.co.uk"
    assert conf == 90

def test_select_email_by_owner_title():
    emails = [
        {"value": "info@business.co.uk", "type": "generic", "confidence": 85, "first_name": None, "last_name": None, "position": None},
        {"value": "john@business.co.uk", "type": "personal", "confidence": 70, "first_name": "John", "last_name": "Doe", "position": "Founder"},
    ]
    email, conf, pos = select_best_email_from_domain_search(emails)
    assert email == "john@business.co.uk"
    assert pos == "Founder"

def test_select_email_highest_confidence_personal():
    emails = [
        {"value": "info@business.co.uk", "type": "generic", "confidence": 90, "first_name": None, "last_name": None, "position": None},
        {"value": "jane@business.co.uk", "type": "personal", "confidence": 75, "first_name": "Jane", "last_name": "Doe", "position": "Manager"},
    ]
    email, conf, pos = select_best_email_from_domain_search(emails)
    assert email == "jane@business.co.uk"

def test_select_email_fallback_to_generic():
    emails = [
        {"value": "info@business.co.uk", "type": "generic", "confidence": 85, "first_name": None, "last_name": None, "position": None},
    ]
    email, conf, pos = select_best_email_from_domain_search(emails)
    assert email == "info@business.co.uk"

def test_select_email_empty_list():
    email, conf, pos = select_best_email_from_domain_search([])
    assert email is None

def test_select_email_no_match_no_title():
    emails = [
        {"value": "info@business.co.uk", "type": "generic", "confidence": 80, "first_name": None, "last_name": None, "position": None},
    ]
    email, conf, pos = select_best_email_from_domain_search(emails, owner_name="Sarah Smith")
    # Falls back to generic
    assert email == "info@business.co.uk"


if __name__ == "__main__":
    # Run all test functions
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_") and callable(v)]
    passed = 0
    failed = 0
    for test in tests:
        try:
            test()
            passed += 1
            print(f"  ✓ {test.__name__}")
        except Exception as e:
            failed += 1
            print(f"  ✗ {test.__name__}: {e}")
    print(f"\n{passed} passed, {failed} failed")
    sys.exit(1 if failed else 0)
