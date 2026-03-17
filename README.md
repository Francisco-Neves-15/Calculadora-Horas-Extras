# Horas Extras Monorepo

Repositorio separado em backend e frontend.

## Estrutura

- `backend/`: API Flask (`/api/v1`), migrations Alembic, testes e SQLite local.
- `frontend/`: placeholder para app React (sem scaffold nesta etapa).

## Backend rapido

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
flask --app backend/app init-db
flask --app backend/app run --debug
```

Documentacao Swagger (dev): `http://127.0.0.1:5000/api/docs/`

Detalhes completos: `backend/README.md`.
