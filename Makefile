.PHONY: init dev stop test build reset

init:
	npm install

dev:
	npx supabase start || true
	@echo "→ http://127.0.0.1:15010"
	npm run dev

stop:
	npx supabase stop

test:
	npm test

build:
	npm run build

reset:
	npx supabase db reset
