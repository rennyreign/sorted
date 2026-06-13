"""
Prospect Finder — Configuration.

All search targets, filter criteria, and constants live here.
Edit this file to change what the operator searches for and where.

No code changes needed to add new search targets — just add to SEARCH_QUERIES.
"""

# ---------------------------------------------------------------------------
# Search Queries
# Each entry is a dict with:
#   category:  what to search for on Google Maps (the "what")
#   location:  where to search (the "where")
# ---------------------------------------------------------------------------

SEARCH_QUERIES = [
    # Personal care
    {"category": "barber shop",       "location": "Warwickshire, UK"},
    {"category": "hair salon",        "location": "Warwickshire, UK"},
    {"category": "nail salon",        "location": "Warwickshire, UK"},
    {"category": "beauty salon",      "location": "Warwickshire, UK"},

    # Fitness
    {"category": "personal trainer",  "location": "Warwickshire, UK"},
    {"category": "gym",               "location": "Warwickshire, UK"},
    {"category": "yoga studio",       "location": "Warwickshire, UK"},

    # Food & hospitality
    {"category": "restaurant",        "location": "Warwickshire, UK"},
    {"category": "cafe",              "location": "Warwickshire, UK"},
    {"category": "takeaway",          "location": "Warwickshire, UK"},

    # Trades & home services
    {"category": "plumber",           "location": "Warwickshire, UK"},
    {"category": "electrician",       "location": "Warwickshire, UK"},
    {"category": "cleaning service",  "location": "Warwickshire, UK"},

    # Professional services
    {"category": "accountant",        "location": "Warwickshire, UK"},
    {"category": "solicitor",         "location": "Warwickshire, UK"},
    {"category": "estate agent",      "location": "Warwickshire, UK"},
]

# ---------------------------------------------------------------------------
# Scraper Settings
# ---------------------------------------------------------------------------

# Max results per query (Apify actor parameter)
# 40 is a safe default — enough signal without burning credits on one query
MAX_RESULTS_PER_QUERY = 40

# ---------------------------------------------------------------------------
# Output Constants
# ---------------------------------------------------------------------------

# Logged at start of run for traceability
OPERATOR_NAME = "prospect-finder"
OPERATOR_VERSION = "1.0.0"
