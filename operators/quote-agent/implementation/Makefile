# Sorted Quote Agent — Makefile

.PHONY: setup dev deploy secrets clean lint

# Install dependencies
setup:
	npm install
	@echo "Dependencies installed. Run 'make secrets' to configure."

# Development server with hot reload
dev:
	npx wrangler dev

# Deploy to Cloudflare Workers
deploy:
	npx wrangler deploy

# Configure required secrets via wrangler
# These are set securely in Cloudflare, not stored in code
secrets:
	@echo "Setting GITHUB_TOKEN (classic PAT with repo read access to rennyreign/sorted)..."
	npx wrangler secret put GITHUB_TOKEN

# Configure optional OpenAI key
secrets-openai:
	@echo "Setting OPENAI_API_KEY (optional - uses Workers AI if not set)..."
	npx wrangler secret put OPENAI_API_KEY

# Type check without emitting
lint:
	npx tsc --noEmit

# Clean build artifacts
clean:
	rm -rf node_modules dist

# Full setup from scratch
init: setup secrets
	@echo "Quote agent ready. Run 'make dev' to start developing."

# Quick deploy workflow
ship: lint deploy
	@echo "Quote agent deployed."
