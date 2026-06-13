.PHONY: setup test run dry-run clean query search

# ---------------------------------------------------------------------------
# Setup — install dependencies into a virtualenv
# ---------------------------------------------------------------------------
setup:
	python3 -m venv venv
	./venv/bin/pip install --upgrade pip
	./venv/bin/pip install -r requirements.txt
	@echo ""
	@echo "Setup complete. Copy .env.example to .env and fill in your credentials."
	@echo "Then: make run"

# ---------------------------------------------------------------------------
# Test — validate credentials and connectivity without writing to DB
# ---------------------------------------------------------------------------
test:
	@echo "Testing credentials and connectivity..."
	./venv/bin/python -c "\
import os; from dotenv import load_dotenv; load_dotenv(); \
apify = os.getenv('APIFY_API_TOKEN'); supabase_url = os.getenv('SUPABASE_URL'); supabase_key = os.getenv('SUPABASE_SERVICE_KEY'); \
print('APIFY_API_TOKEN:', 'set' if apify else 'MISSING'); \
print('SUPABASE_URL:', supabase_url if supabase_url else 'MISSING'); \
print('SUPABASE_SERVICE_KEY:', 'set' if supabase_key else 'MISSING'); \
missing = [k for k, v in [('APIFY_API_TOKEN', apify), ('SUPABASE_URL', supabase_url), ('SUPABASE_SERVICE_KEY', supabase_key)] if not v]; \
exit(1) if missing else print('All credentials present.')"

# ---------------------------------------------------------------------------
# Dry run — search and filter, no database writes
# ---------------------------------------------------------------------------
dry-run:
	./venv/bin/python main.py --dry-run

# ---------------------------------------------------------------------------
# Run — full pipeline with database writes
# ---------------------------------------------------------------------------
run:
	./venv/bin/python main.py

# ---------------------------------------------------------------------------
# Single query — run one category (partial name match)
# Usage: make query CATEGORY="barber"
# ---------------------------------------------------------------------------
query:
	./venv/bin/python main.py --query "$(CATEGORY)"

# ---------------------------------------------------------------------------
# Search — run one category in a specific location (overrides config.py)
# Usage: make search CATEGORY="restaurant" LOCATION="Warwickshire, UK"
# ---------------------------------------------------------------------------
search:
	./venv/bin/python main.py --query "$(CATEGORY)" --location "$(LOCATION)"

# ---------------------------------------------------------------------------
# Clean
# ---------------------------------------------------------------------------
clean:
	rm -rf venv __pycache__ scraper/__pycache__ storage/__pycache__
