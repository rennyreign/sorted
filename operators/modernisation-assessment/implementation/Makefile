.PHONY: setup test dry-run analyse preview preview-html run clean

# ---------------------------------------------------------------------------
# Setup — create venv and install dependencies
# ---------------------------------------------------------------------------
setup:
	python3 -m venv venv
	./venv/bin/pip install --upgrade pip
	./venv/bin/pip install -r requirements.txt
	@echo ""
	@echo "Setup complete. Copy .env.example to .env if you need API keys or Supabase."
	@echo "Then: make analyse URL=https://example.com"

# ---------------------------------------------------------------------------
# Test — validate that the operator can import without errors
# ---------------------------------------------------------------------------
test:
	./venv/bin/python -c "from collector.crawler import EvidenceCollector; from report.report import ReportBuilder; print('imports ok')"

# ---------------------------------------------------------------------------
# Dry run — single URL, no DB writes, no screenshots
# ---------------------------------------------------------------------------
dry-run:
	./venv/bin/python main.py --url "https://example.com" --pretty

# ---------------------------------------------------------------------------
# Analyse a single URL
# Usage: make analyse URL=https://example.com
#        make analyse URL=https://example.com NAME="Acme" CATEGORY="plumber"
# ---------------------------------------------------------------------------
analyse:
	./venv/bin/python main.py \
		--url "$(URL)" \
		$(if $(NAME),--name "$(NAME)",) \
		$(if $(CATEGORY),--category "$(CATEGORY)",) \
		$(if $(LOCATION),--location "$(LOCATION)",) \
		--pretty

# ---------------------------------------------------------------------------
# Preview — generate HTML report and serve at localhost:8080
# Usage: make preview URL=https://example.com
#        make preview URL=https://example.com PREVIEW_PORT=3000
# ---------------------------------------------------------------------------
preview:
	./venv/bin/python main.py \
		--url "$(URL)" \
		$(if $(NAME),--name "$(NAME)",) \
		$(if $(CATEGORY),--category "$(CATEGORY)",) \
		$(if $(LOCATION),--location "$(LOCATION)",) \
		--preview \
		$(if $(PREVIEW_PORT),--preview-port $(PREVIEW_PORT),)

# ---------------------------------------------------------------------------
# Generate HTML report file (no server)
# Usage: make preview-html URL=https://example.com HTML=report.html
# ---------------------------------------------------------------------------
preview-html:
	./venv/bin/python main.py \
		--url "$(URL)" \
		$(if $(NAME),--name "$(NAME)",) \
		$(if $(CATEGORY),--category "$(CATEGORY)",) \
		$(if $(LOCATION),--location "$(LOCATION)",) \
		--html "$(HTML)"

# ---------------------------------------------------------------------------
# Full batch run — write results to Supabase (requires migration.sql applied)
# ---------------------------------------------------------------------------
run:
	./venv/bin/python main.py --write --limit 50

# ---------------------------------------------------------------------------
# Clean
# ---------------------------------------------------------------------------
clean:
	rm -rf venv __pycache__ collector/__pycache__ scorers/__pycache__ report/__pycache__ storage/__pycache__
