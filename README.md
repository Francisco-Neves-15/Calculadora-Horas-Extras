# Horas Extras

Aplicacao Flask local para controle de horas extras com SQLite, cadastro aberto por e-mail, configuracoes por usuario, calculo automatico e backend `API-first` com camada web transitória.

## Requisitos

- Python 3.11+
- `pip`

## Como rodar

Criação do Venv
```bash
python3 -m venv .venv
```

Ativação do Venv
```bash
# Mac / Linux
source .venv/bin/activate
# Windows
.venv\Scripts\Activate.ps1
# Windows (CMD)
.venv\Scripts\activate
```

Instalação de Requerimentos
```bash
pip install -r requirements.txt
```

Flask Init
```bash
flask --app app init-db
```

Flask Start
```bash
flask --app app run --debug
```

Depois, acesse `http://127.0.0.1:5000`.
Documentacao Swagger UI: `http://127.0.0.1:5000/api/docs/`

## Fluxo de uso

- A primeira pessoa que se cadastrar vira admin e recebe o historico legado do banco local.
- Cada usuario acessa apenas os proprios lancamentos e as proprias configuracoes.
- Salario, carga horaria e regras de calculo ficam salvos por usuario.
- O backend atende tanto a UI server-side atual quanto a API JSON em `/api/v1`.

## O que o sistema faz

- Cadastro aberto com login por e-mail e senha
- CRUD completo de lancamentos por usuario
- Modo manual para ajustes diretos de credito/debito
- Modo calculado com inicio, fim, intervalo e horas normais dentro do lancamento
- Dashboard com saldo do mes, saldo acumulado, horas noturnas, credito de sabado/domingo e valor estimado do mes
- Tela de configuracoes pessoais com salario bruto, carga mensal, jornada semanal e multiplicadores
- API JSON com endpoints para `auth`, `me`, `dashboard`, `settings` e `entries`
- Persistencia local em `instance/horas_extras.db`

## API

- Base path: `/api/v1`
- Swagger UI: `/api/docs/`
- Spec JSON: `/api/swagger.json`
- Endpoints disponiveis:
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

### Sessao e CSRF

- A API usa `cookie de sessao HttpOnly` para autenticacao.
- Requests mutaveis da API (`POST`, `PATCH`, `DELETE`) exigem header `X-CSRF-Token`.
- O front deve fazer bootstrap com `GET /api/v1/auth/me`; essa rota devolve o estado da sessao atual e o token CSRF mais recente no corpo e no header `X-CSRF-Token`.
- O fluxo recomendado para SPA no mesmo dominio/proxy e:
  1. `GET /api/v1/auth/me`
  2. usar o token recebido no header/body
  3. chamar `register`, `login`, `settings` ou `entries`

## Regras padrao de um novo perfil

- Seg-sex: `08:00` de horas normais por lancamento
- Sabado: `00:00` de horas normais por lancamento
- Domingo: `00:00` de horas normais por lancamento
- Hora extra em dia util: multiplicador `1.50`
- Hora extra em sabado: multiplicador `1.50`
- Domingo: multiplicador `2.00`
- Noturno: faixa `22:00` ate `05:00`, com adicional de `20%` e hora reduzida

## Observacoes

- O valor/hora usa a carga mensal como fonte de verdade. A jornada semanal e apenas um helper opcional.
- Para blocos que ja sao totalmente extras, informe `00:00` em “Horas normais dentro do lancamento”.
- A evolucao do banco agora e versionada por Alembic. Rode `flask --app app init-db` para aplicar as migrations pendentes.
- A camada web atual continua disponivel, mas a API e a fonte de verdade para novas integracoes/front-ends.

## Testes

```bash
pytest
```
