# Horas Extras Monorepo
# kda: Gerente Horas Extras

Repositório único para frontend e backend

## Estrutura

- `backend/`: API Flask (`/api/v1`), migrations Alembic, testes e SQLite local.
- `frontend/`: React Next.

## Backend rapido

### Init venv
```bash
python3 -m venv .venv
```

### Active venv

- Mac & Linux
```bash
source .venv/bin/activate
```

- Windows
```bash
.\.venv\Scripts\activate
```
or
```bash
.\.venv\Scripts\activate.ps1
```

### Install Reqs
```bash
pip install -r backend/requirements.txt
```

### Install Init Db
```bash
flask --app backend/app init-db
```

### Init Back
```bash
flask --app backend/app run --debug
```

Documentacao Swagger (dev): `http://127.0.0.1:5000/api/docs/`

Detalhes completos: `backend/README.md`.
