"""
Prospect Finder — Configuration.

All search targets, filter criteria, and constants live here.
Edit this file to change what the operator searches for and where.

No code changes needed to add new search targets — just add to SEARCH_QUERIES.

City targets (in priority order):
  1. London, UK          ← primary focus, nightly run
  2. Dublin, Ireland
  3. New York City, USA
  4. Toronto, Canada
  5. Singapore

The nightly schedule runs ACTIVE_QUERIES only (London).
All other cities are defined in CITY_QUERIES and can be run manually:
  python main.py --location "Dublin, Ireland"
"""

# ---------------------------------------------------------------------------
# Categories — shared across all cities
# ---------------------------------------------------------------------------

CATEGORIES = [
    # Priority segments
    "dentist",
    "accountant",
    "boutique hotel",
    "hair salon",
    "nail salon",
    "beauty salon",

    # Fitness
    "personal trainer",
    "gym",
    "yoga studio",

    # Food & hospitality
    "restaurant",
    "cafe",
    "takeaway",

    # Trades & home services (high volume of weak sites)
    "plumber",
    "electrician",
    "cleaning service",
    "barber shop",

    # Professional services
    "solicitor",
    "estate agent",
]

# ---------------------------------------------------------------------------
# City targets
# ---------------------------------------------------------------------------

CITIES = {
    "london":    "London, UK",
    "dublin":    "Dublin, Ireland",
    "new_york":  "New York City, USA",
    "toronto":   "Toronto, Canada",
    "singapore": "Singapore",
}

# Primary city — used for the nightly automated run
PRIMARY_CITY = CITIES["london"]

# ---------------------------------------------------------------------------
# Search Queries
# Each entry is a dict with:
#   category:  what to search for on Google Maps (the "what")
#   location:  where to search (the "where")
#
# ACTIVE_QUERIES = London only (nightly schedule).
# CITY_QUERIES   = all cities (manual / future multi-city runs).
# ---------------------------------------------------------------------------

ACTIVE_QUERIES = [
    {"category": cat, "location": PRIMARY_CITY}
    for cat in CATEGORIES
]

CITY_QUERIES = [
    {"category": cat, "location": city}
    for city in CITIES.values()
    for cat in CATEGORIES
]

# The nightly run uses ACTIVE_QUERIES
SEARCH_QUERIES = ACTIVE_QUERIES

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
