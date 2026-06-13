.PHONY: setup test run dry-run analyse clean

# ---------------------------------------------------------------------------
# Setup — install dependencies into a virtualenv
# ---------------------------------------------------------------------------
setup:
	python3 -m venv venv
	./venv/bin/pip install --upgrade pip
	./venv/bin/pip install -r requirements.txt
	@echo ""
	@echo "Setup complete. Copy .env.example to .env and fill in your credentials."
	@echo "Then: make dry-run"

# ---------------------------------------------------------------------------
# Test — validate credentials without writing to DB
# ---------------------------------------------------------------------------
test:
	@echo "Testing credentials..."
	./venv/bin/python -c "\
import os; from dotenv import load_dotenv; load_dotenv(); \
openai = os.getenv('OPENAI_API_KEY'); supa_url = os.getenv('SUPABASE_URL'); supa_key = os.getenv('SUPABASE_SERVICE_KEY'); \
print('OPENAI_API_KEY:', 'set' if openai else 'MISSING'); \
print('SUPABASE_URL:', supa_url if supa_url else 'MISSING'); \
print('SUPABASE_SERVICE_KEY:', 'set' if supa_key else 'MISSING'); \
print('SCREENSHOT_API_KEY:', 'set' if os.getenv('SCREENSHOT_API_KEY') else 'not set (playwright fallback will be used)'); \
missing = [k for k, v in [('OPENAI_API_KEY', openai), ('SUPABASE_URL', supa_url), ('SUPABASE_SERVICE_KEY', supa_key)] if not v]; \
exit(1) if missing else print('Required credentials present.')"

# ---------------------------------------------------------------------------
# Dry run — screenshot and analyse, no database writes
# ---------------------------------------------------------------------------
dry-run:
	./venv/bin/python main.py --dry-run --limit 5

# ---------------------------------------------------------------------------
# Full run — analyse all unanalysed prospects
# ---------------------------------------------------------------------------
run:
	./venv/bin/python main.py

# ---------------------------------------------------------------------------
# Analyse a single URL (ad-hoc, prints JSON result, no DB write)
# Usage: make analyse URL=https://example.com
#        make analyse URL=https://example.com NAME="Joe's Barbers" CATEGORY="barber shop"
# ---------------------------------------------------------------------------
analyse:
	./venv/bin/python main.py \
		--url "$(URL)" \
		$(if $(NAME),--name "$(NAME)",) \
		$(if $(CATEGORY),--category "$(CATEGORY)",) \
		$(if $(LOCATION),--location "$(LOCATION)",)

# ---------------------------------------------------------------------------
# Clean
# ---------------------------------------------------------------------------
clean:
	rm -rf venv __pycache__ analyser/__pycache__ storage/__pycache__
