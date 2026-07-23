"""
Tests for Owner Identifier operator — Companies House + website scraping.

Tests name cleaning, officer role detection, and owner selection logic
without making real API calls.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from main import (
    ch_clean_name,
    ch_is_director_role,
    select_best_owner,
)


# ─── ch_clean_name ────────────────────────────────────────────────────────────

def test_clean_name_surname_first():
    """Companies House stores names as 'SURNAME, Firstname'"""
    assert ch_clean_name("SMITH, Sarah") == "Sarah Smith"

def test_clean_name_surname_only():
    assert ch_clean_name("SMITH") == "Smith"

def test_clean_name_already_normal():
    assert ch_clean_name("Sarah Smith") == "Sarah Smith"

def test_clean_name_none():
    assert ch_clean_name(None) is None

def test_clean_name_empty():
    assert ch_clean_name("") is None


# ─── ch_is_director_role ──────────────────────────────────────────────────────

def test_director_role_director():
    assert ch_is_director_role("director") is True

def test_director_role_managing_officer():
    assert ch_is_director_role("managing-officer") is True

def test_director_role_nominee_director():
    assert ch_is_director_role("nominee-director") is True

def test_director_role_secretary():
    assert ch_is_director_role("secretary") is False

def test_director_role_none():
    assert ch_is_director_role(None) is False


# ─── select_best_owner ────────────────────────────────────────────────────────

def test_select_owner_prefers_companies_house():
    officers = [
        {"name": "SMITH, Sarah", "officer_role": "director", "appointed_on": "2020-01-01"},
        {"name": "JONES, John", "officer_role": "director", "appointed_on": "2022-01-01"},
    ]
    owner = select_best_owner(officers, [])
    assert owner is not None
    assert owner["name"] == "Sarah Smith"
    assert owner["role"] == "Director"
    assert owner["source"] == "companies_house"

def test_select_owner_picks_longest_serving():
    officers = [
        {"name": "BROWN, Bob", "officer_role": "director", "appointed_on": "2023-01-01"},
        {"name": "OLDER, Olive", "officer_role": "director", "appointed_on": "2015-01-01"},
    ]
    owner = select_best_owner(officers, [])
    assert owner["name"] == "Olive Older"

def test_select_owner_falls_back_to_website():
    candidates = [
        {"name": "Jane Doe", "role": "Founder", "source_url": "https://example.com/about"},
    ]
    owner = select_best_owner([], candidates)
    assert owner is not None
    assert owner["name"] == "Jane Doe"
    assert owner["source"] == "website"

def test_select_owner_prefers_owner_title_from_website():
    candidates = [
        {"name": "Bob Smith", "role": "Manager", "source_url": "https://example.com/team"},
        {"name": "Jane Doe", "role": "Owner", "source_url": "https://example.com/about"},
    ]
    owner = select_best_owner([], candidates)
    assert owner["name"] == "Jane Doe"
    assert owner["role"] == "Owner"

def test_select_owner_returns_none_for_empty():
    owner = select_best_owner([], [])
    assert owner is None

def test_select_owner_skips_resigned_officers():
    # Resigned officers are filtered before reaching select_best_owner
    # but if only non-director officers remain, falls back to website
    officers = [
        {"name": "SMITH, Sarah", "officer_role": "secretary", "appointed_on": "2020-01-01"},
    ]
    candidates = [
        {"name": "Jane Doe", "role": "Owner", "source_url": "https://example.com/about"},
    ]
    owner = select_best_owner(officers, candidates)
    # Secretary is not a director role, so falls back to website
    assert owner["source"] == "website"
    assert owner["name"] == "Jane Doe"


if __name__ == "__main__":
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
