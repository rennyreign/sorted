.PHONY: setup test run dry-run clean

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
# Test — validate credentials and connectivity
# ---------------------------------------------------------------------------
test:
	@echo "Testing credentials and connectivity..."
	./venv/bin/python -c "\
import os; from dotenv import load_dotenv; load_dotenv(); \
hunter = os.getenv('HUNTER_API_KEY'); supabase_url = os.getenv('SUPABASE_URL'); supabase_key = os.getenv('SUPABASE_SERVICE_KEY'); \
print('HUNTER_API_KEY:', 'set' if hunter else 'MISSING'); \
print('SUPABASE_URL:', supabase_url if supabase_url else 'MISSING'); \
print('SUPABASE_SERVICE_KEY:', 'set' if supabase_key else 'MISSING'); \
missing = [k for k, v in [('HUNTER_API_KEY', hunter), ('SUPABASE_URL', supabase_url), ('SUPABASE_SERVICE_KEY', supabase_key)] if not v]; \
exit(1) if missing else print('All credentials present.')"

# ---------------------------------------------------------------------------
# Dry run — search but do not write to DB
# ---------------------------------------------------------------------------
dry-run:
	./venv/bin/python main.py --dry-run --limit 33

# ---------------------------------------------------------------------------
# Run — full pipeline with DB writes (uses up to 33 credits)
# ---------------------------------------------------------------------------
run:
	./venv/bin/python main.py --limit 33

# ---------------------------------------------------------------------------
# Run with domain search first (uses free searches + credits)
# ---------------------------------------------------------------------------
run-full:
	./venv/bin/python main.py --limit 33 --domain-search

# ---------------------------------------------------------------------------
# Clean
# ---------------------------------------------------------------------------
clean:
	rm -rf venv __pycache__ enricher/__pycache__ storage/__pycache__
