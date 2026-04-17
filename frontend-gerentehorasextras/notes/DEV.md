# Frontend (Next.js / React)

Pasta do frontend: `frontend-gerentehorasextras/`

## Rodar o projeto

```bash
cd frontend-gerentehorasextras
npm install
npm run dev
```

## Scripts úteis

```bash
npm run format
npm run lint
npm run typecheck
npm run validate
```

## Husky (hooks do Git)

### Por que não funcionava aqui

O repositório Git (`.git/`) fica na raiz do projeto, mas o frontend fica em `frontend-gerentehorasextras/`.
Se você roda `npx husky init` dentro do `frontend-gerentehorasextras/`, o Husky tenta achar `.git` ali e falha (ex.: “.git can't be found”).

### Como habilitar os hooks (uma vez por clone)

Rode este comando na raiz do repositório:

```bash
git config core.hooksPath frontend-gerentehorasextras/.husky
```

Verifique:

```bash
git config --get core.hooksPath
```

Deve imprimir: `frontend-gerentehorasextras/.husky`

### Hooks configurados

- `pre-commit`: formata o que está staged (Prettier) e tenta aplicar `eslint --fix` em `.ts/.tsx` staged (não bloqueia o commit se o ESLint falhar).
- `pre-push`: roda `npm run build` + `npm run validate`.

### Pular hooks (quando necessário)

```bash
git commit --no-verify -m "Mensagem"
git push --no-verify
```

### Troubleshooting

- Se aparecer `Permission denied` ao rodar `git config ...`, feche IDEs/terminais que estejam segurando o `.git/config` e rode novamente (ou execute o terminal como Admin).
- Se os hooks estiverem “ligados”, mas não rodarem, confirme que você está usando o Git do próprio repositório (ex.: GitHub Desktop) e que `core.hooksPath` está setado no repo (não só global).
- Se o hook der erro do tipo `/usr/bin/env: 'sh\r': No such file or directory`, é CRLF nos arquivos de hook. Rode `git add --renormalize frontend-gerentehorasextras/.husky` e faça commit (o repo já tem regra de `eol=lf` pra `.husky/`).


# Backend

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
