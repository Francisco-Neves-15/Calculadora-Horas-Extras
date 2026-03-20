# Frontend (Stub)

Este diretorio foi reservado para o app React, mas nao inclui instalacao nem scaffold nesta etapa.

## Contrato esperado com o backend

- Base URL da API: `http://localhost:5000/api/v1`
- Swagger: `http://localhost:5000/api/docs/` (dev)
- Spec JSON: `http://localhost:5000/api/swagger.json` (dev)

## Fluxo de autenticacao (session + CSRF)

1. Fazer `GET /api/v1/auth/me` para bootstrap.
2. Ler token no header `X-CSRF-Token`.
3. Enviar `credentials: "include"` em todas as requests.
4. Enviar `X-CSRF-Token` em `POST`, `PATCH` e `DELETE`.

## CORS

- O backend aceita origens definidas por `CORS_ALLOWED_ORIGINS`.
- Default de desenvolvimento: `http://localhost:5173`.
