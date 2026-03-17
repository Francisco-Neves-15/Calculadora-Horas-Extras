# Backend API (Flask)

Backend API-only para controle de horas extras.

## Requisitos

- Python 3.11+
- `pip`

## Como rodar

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
flask --app backend/app init-db
flask --app backend/app run --debug
```

API base URL: `http://127.0.0.1:5000/api/v1`

## Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/dashboard`
- `GET /api/v1/settings`
- `PATCH /api/v1/settings`
- `GET /api/v1/entries`
- `POST /api/v1/entries`
- `GET /api/v1/entries/<id>`
- `PATCH /api/v1/entries/<id>`
- `DELETE /api/v1/entries/<id>`

## Sessao, CSRF e CORS

- Autenticacao via cookie de sessao (`HttpOnly`).
- Requests mutaveis (`POST`, `PATCH`, `DELETE`) exigem header `X-CSRF-Token`.
- Bootstrap recomendado do front: `GET /api/v1/auth/me`.
- CORS habilitado apenas para origens permitidas por `CORS_ALLOWED_ORIGINS` (csv).

## Configuracao por ambiente

- Exemplo de variaveis: `backend/.env.example`
- `APP_ENV=development|production` (default: `development`)
- `ENABLE_SWAGGER=true|false` (default: `true` em dev, `false` em production)
- `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000`
- `SESSION_COOKIE_SECURE=true|false` (default: `false` em dev, `true` em production)
- `SESSION_COOKIE_SAMESITE=Lax|None|Strict` (default: `Lax` em dev, `None` em production)

## Swagger

- UI: `/api/docs/`
- Spec JSON: `/api/swagger.json`
- Em production, use `ENABLE_SWAGGER=false` para desabilitar rotas de docs.

## Banco

- Persistencia local em `backend/instance/horas_extras.db`.
- Migrations com Alembic.
- Inicializacao/migracao:

```bash
flask --app backend/app init-db
```

## Testes

```bash
pytest backend/tests
```
