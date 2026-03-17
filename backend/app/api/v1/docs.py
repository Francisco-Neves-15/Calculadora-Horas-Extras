CSRF_HEADER_PARAMETER = {
    "in": "header",
    "name": "X-CSRF-Token",
    "type": "string",
    "required": True,
    "description": "Token CSRF obtido em `GET /api/v1/auth/me` ou no header de respostas anteriores da API.",
}


SWAGGER_CONFIG = {
    "headers": [],
    "specs": [
        {
            "endpoint": "api_v1_spec",
            "route": "/api/swagger.json",
            "rule_filter": lambda rule: rule.endpoint.startswith("api_v1."),
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "specs_route": "/api/docs/",
    "title": "Horas Extras API Docs",
    "uiversion": 3,
}


SWAGGER_TEMPLATE = {
    "swagger": "2.0",
    "info": {
        "title": "Horas Extras API",
        "version": "1.0.0",
        "description": (
            "Documentacao da API JSON do sistema de horas extras. "
            "A autenticacao usa cookie de sessao e requests mutaveis exigem `X-CSRF-Token`."
        ),
    },
    "basePath": "/",
    "schemes": ["http", "https"],
    "consumes": ["application/json"],
    "produces": ["application/json"],
    "tags": [
        {"name": "Auth", "description": "Cadastro, login, logout e sessao atual."},
        {"name": "Dashboard", "description": "Resumo agregado do colaborador autenticado."},
        {"name": "Settings", "description": "Configuracoes pessoais de calculo."},
        {"name": "Entries", "description": "CRUD de lancamentos e listagem filtrada."},
    ],
    "definitions": {
        "User": {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "email": {"type": "string", "example": "isaac@example.com"},
                "display_name": {"type": "string", "example": "Isaac Silva"},
                "is_admin": {"type": "boolean"},
                "created_at": {"type": "string", "format": "date-time"},
                "last_login_at": {"type": "string", "format": "date-time"},
            },
        },
        "SessionResponse": {
            "type": "object",
            "properties": {
                "authenticated": {"type": "boolean"},
                "user": {"$ref": "#/definitions/User"},
                "csrf_token": {"type": "string"},
                "claimed_legacy_entries": {"type": "integer"},
            },
        },
        "RegisterRequest": {
            "type": "object",
            "required": ["display_name", "email", "password", "password_confirm"],
            "properties": {
                "display_name": {"type": "string", "example": "Isaac Silva"},
                "email": {"type": "string", "example": "isaac@example.com"},
                "password": {"type": "string", "example": "segredo123"},
                "password_confirm": {"type": "string", "example": "segredo123"},
            },
        },
        "LoginRequest": {
            "type": "object",
            "required": ["email", "password"],
            "properties": {
                "email": {"type": "string", "example": "isaac@example.com"},
                "password": {"type": "string", "example": "segredo123"},
            },
        },
        "SettingsResponse": {
            "type": "object",
            "properties": {
                "gross_salary_cents": {"type": "integer", "example": 431800},
                "monthly_workload_minutes": {"type": "integer", "example": 10340},
                "weekly_workload_minutes": {"type": "integer", "example": 2400},
                "weekday_expected_minutes": {"type": "integer", "example": 480},
                "saturday_expected_minutes": {"type": "integer", "example": 0},
                "sunday_expected_minutes": {"type": "integer", "example": 0},
                "weekday_overtime_multiplier": {"type": "number", "example": 1.5},
                "saturday_overtime_multiplier": {"type": "number", "example": 1.5},
                "sunday_work_multiplier": {"type": "number", "example": 2.0},
                "hourly_rate_cents": {"type": "integer", "example": 2506},
            },
        },
        "SettingsPatchRequest": {
            "type": "object",
            "properties": {
                "gross_salary_cents": {"type": "integer", "example": 431800},
                "monthly_workload_minutes": {"type": "integer", "example": 10340},
                "weekly_workload_minutes": {"type": "integer", "example": 2400},
                "weekday_expected_minutes": {"type": "integer", "example": 480},
                "saturday_expected_minutes": {"type": "integer", "example": 0},
                "sunday_expected_minutes": {"type": "integer", "example": 0},
                "weekday_overtime_multiplier": {"type": "number", "example": 1.5},
                "saturday_overtime_multiplier": {"type": "number", "example": 1.5},
                "sunday_work_multiplier": {"type": "number", "example": 2.0},
            },
        },
        "Entry": {
            "type": "object",
            "properties": {
                "id": {"type": "integer"},
                "entry_date": {"type": "string", "format": "date", "example": "2026-03-10"},
                "movement_type": {"type": "string", "example": "credit"},
                "duration_minutes": {"type": "integer", "example": 90},
                "signed_minutes": {"type": "integer", "example": 90},
                "category": {"type": "string", "example": "Hora extra"},
                "notes": {"type": "string", "example": "Plantao de fechamento"},
                "entry_mode": {"type": "string", "example": "manual"},
                "start_time": {"type": "string", "example": "09:00"},
                "end_time": {"type": "string", "example": "12:00"},
                "break_minutes": {"type": "integer", "example": 0},
                "expected_minutes": {"type": "integer", "example": 0},
                "worked_minutes": {"type": "integer", "example": 180},
                "overtime_minutes": {"type": "integer", "example": 180},
                "night_minutes": {"type": "integer", "example": 0},
                "weekend_minutes": {"type": "integer", "example": 180},
                "weekend_credit_minutes": {"type": "integer", "example": 270},
                "night_bonus_minutes": {"type": "integer", "example": 0},
                "estimated_value_cents": {"type": "integer", "example": 11275},
                "applied_weekday_expected_minutes": {"type": "integer", "example": 480},
                "applied_saturday_expected_minutes": {"type": "integer", "example": 0},
                "applied_sunday_expected_minutes": {"type": "integer", "example": 0},
                "applied_weekday_overtime_multiplier": {"type": "number", "example": 1.5},
                "applied_saturday_overtime_multiplier": {"type": "number", "example": 1.5},
                "applied_sunday_work_multiplier": {"type": "number", "example": 2.0},
                "created_at": {"type": "string", "format": "date-time"},
                "updated_at": {"type": "string", "format": "date-time"},
            },
        },
        "EntryCreateRequest": {
            "type": "object",
            "required": ["entry_date", "entry_mode", "category"],
            "properties": {
                "entry_date": {"type": "string", "format": "date", "example": "2026-03-10"},
                "entry_mode": {"type": "string", "enum": ["manual", "calculated"], "example": "manual"},
                "movement_type": {"type": "string", "enum": ["credit", "debit"], "example": "credit"},
                "duration_minutes": {"type": "integer", "example": 90},
                "start_time": {"type": "string", "example": "09:00"},
                "end_time": {"type": "string", "example": "12:00"},
                "break_minutes": {"type": "integer", "example": 0},
                "expected_minutes": {"type": "integer", "example": 0},
                "category": {"type": "string", "example": "Hora extra"},
                "notes": {"type": "string", "example": "Plantao de fechamento"},
            },
        },
        "EntryUpdateRequest": {
            "type": "object",
            "properties": {
                "entry_date": {"type": "string", "format": "date"},
                "entry_mode": {"type": "string", "enum": ["manual", "calculated"]},
                "movement_type": {"type": "string", "enum": ["credit", "debit"]},
                "duration_minutes": {"type": "integer"},
                "start_time": {"type": "string", "example": "09:00"},
                "end_time": {"type": "string", "example": "12:00"},
                "break_minutes": {"type": "integer"},
                "expected_minutes": {"type": "integer"},
                "category": {"type": "string"},
                "notes": {"type": "string"},
            },
        },
        "EntryListMeta": {
            "type": "object",
            "properties": {
                "page": {"type": "integer"},
                "page_size": {"type": "integer"},
                "total_items": {"type": "integer"},
                "total_pages": {"type": "integer"},
                "month": {"type": "integer"},
                "year": {"type": "integer"},
                "category": {"type": "string"},
                "filtered_balance_minutes": {"type": "integer"},
                "filtered_night_minutes": {"type": "integer"},
                "filtered_weekend_credit_minutes": {"type": "integer"},
                "filtered_estimated_value_cents": {"type": "integer"},
            },
        },
        "EntryFilterOptions": {
            "type": "object",
            "properties": {
                "categories": {"type": "array", "items": {"type": "string"}},
                "years": {"type": "array", "items": {"type": "integer"}},
            },
        },
        "EntryListResponse": {
            "type": "object",
            "properties": {
                "items": {"type": "array", "items": {"$ref": "#/definitions/Entry"}},
                "meta": {"$ref": "#/definitions/EntryListMeta"},
                "filter_options": {"$ref": "#/definitions/EntryFilterOptions"},
            },
        },
        "DashboardSummary": {
            "type": "object",
            "properties": {
                "current_month": {"type": "integer"},
                "current_year": {"type": "integer"},
                "current_month_label": {"type": "string"},
                "current_balance_minutes": {"type": "integer"},
                "accumulated_balance_minutes": {"type": "integer"},
                "monthly_credit_minutes": {"type": "integer"},
                "monthly_debit_minutes": {"type": "integer"},
                "monthly_night_minutes": {"type": "integer"},
                "monthly_weekend_credit_minutes": {"type": "integer"},
                "monthly_estimated_value_cents": {"type": "integer"},
                "hourly_rate_cents": {"type": "integer"},
                "settings_ready": {"type": "boolean"},
                "entries_count": {"type": "integer"},
            },
        },
        "DashboardChartItem": {
            "type": "object",
            "properties": {
                "year": {"type": "integer"},
                "month": {"type": "integer"},
                "label": {"type": "string"},
                "balance_minutes": {"type": "integer"},
                "width_percent": {"type": "number"},
                "direction": {"type": "string"},
            },
        },
        "DashboardResponse": {
            "type": "object",
            "properties": {
                "summary": {"$ref": "#/definitions/DashboardSummary"},
                "chart_data": {"type": "array", "items": {"$ref": "#/definitions/DashboardChartItem"}},
                "recent_entries": {"type": "array", "items": {"$ref": "#/definitions/Entry"}},
            },
        },
        "DeleteEntryResponse": {
            "type": "object",
            "properties": {
                "deleted": {"type": "boolean"},
                "id": {"type": "integer"},
            },
        },
        "ErrorIssue": {
            "type": "object",
            "properties": {
                "location": {"type": "string"},
                "message": {"type": "string"},
            },
        },
        "ErrorObject": {
            "type": "object",
            "properties": {
                "code": {"type": "string"},
                "message": {"type": "string"},
                "details": {"type": "object"},
            },
        },
        "ErrorResponse": {
            "type": "object",
            "properties": {
                "error": {"$ref": "#/definitions/ErrorObject"},
            },
        },
    },
}


AUTH_REGISTER_DOC = {
    "tags": ["Auth"],
    "summary": "Cria uma nova conta e inicia a sessao.",
    "parameters": [
        CSRF_HEADER_PARAMETER,
        {"in": "body", "name": "body", "required": True, "schema": {"$ref": "#/definitions/RegisterRequest"}},
    ],
    "responses": {
        "201": {"description": "Conta criada.", "schema": {"$ref": "#/definitions/SessionResponse"}},
        "403": {"description": "CSRF ausente ou invalido.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
        "422": {"description": "Payload invalido.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
    },
}


AUTH_LOGIN_DOC = {
    "tags": ["Auth"],
    "summary": "Autentica um usuario existente.",
    "parameters": [
        CSRF_HEADER_PARAMETER,
        {"in": "body", "name": "body", "required": True, "schema": {"$ref": "#/definitions/LoginRequest"}},
    ],
    "responses": {
        "200": {"description": "Sessao iniciada.", "schema": {"$ref": "#/definitions/SessionResponse"}},
        "401": {"description": "Credenciais invalidas.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
        "403": {"description": "CSRF ausente ou invalido.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
        "422": {"description": "Payload invalido.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
    },
}


AUTH_LOGOUT_DOC = {
    "tags": ["Auth"],
    "summary": "Encerra a sessao atual.",
    "parameters": [CSRF_HEADER_PARAMETER],
    "responses": {
        "200": {"description": "Sessao encerrada.", "schema": {"$ref": "#/definitions/SessionResponse"}},
        "403": {"description": "CSRF ausente ou invalido.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
    },
}


AUTH_ME_DOC = {
    "tags": ["Auth"],
    "summary": "Retorna o estado atual da sessao e um token CSRF.",
    "responses": {
        "200": {"description": "Estado atual da sessao.", "schema": {"$ref": "#/definitions/SessionResponse"}},
    },
}


DASHBOARD_DOC = {
    "tags": ["Dashboard"],
    "summary": "Retorna o painel agregado do usuario autenticado.",
    "responses": {
        "200": {"description": "Resumo do dashboard.", "schema": {"$ref": "#/definitions/DashboardResponse"}},
        "401": {"description": "Autenticacao obrigatoria.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
    },
}


GET_SETTINGS_DOC = {
    "tags": ["Settings"],
    "summary": "Retorna as configuracoes pessoais do usuario autenticado.",
    "responses": {
        "200": {"description": "Configuracoes atuais.", "schema": {"$ref": "#/definitions/SettingsResponse"}},
        "401": {"description": "Autenticacao obrigatoria.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
    },
}


PATCH_SETTINGS_DOC = {
    "tags": ["Settings"],
    "summary": "Atualiza parcialmente as configuracoes pessoais.",
    "parameters": [
        CSRF_HEADER_PARAMETER,
        {
            "in": "body",
            "name": "body",
            "required": True,
            "schema": {"$ref": "#/definitions/SettingsPatchRequest"},
        },
    ],
    "responses": {
        "200": {"description": "Configuracoes atualizadas.", "schema": {"$ref": "#/definitions/SettingsResponse"}},
        "401": {"description": "Autenticacao obrigatoria.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
        "403": {"description": "CSRF ausente ou invalido.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
        "422": {"description": "Payload invalido.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
    },
}


LIST_ENTRIES_DOC = {
    "tags": ["Entries"],
    "summary": "Lista lancamentos do usuario com filtros e paginacao.",
    "parameters": [
        {"in": "query", "name": "month", "type": "integer", "required": False},
        {"in": "query", "name": "year", "type": "integer", "required": False},
        {"in": "query", "name": "category", "type": "string", "required": False},
        {"in": "query", "name": "page", "type": "integer", "required": False, "default": 1},
        {"in": "query", "name": "page_size", "type": "integer", "required": False, "default": 20},
    ],
    "responses": {
        "200": {"description": "Lista paginada.", "schema": {"$ref": "#/definitions/EntryListResponse"}},
        "401": {"description": "Autenticacao obrigatoria.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
        "422": {"description": "Query invalida.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
    },
}


CREATE_ENTRY_DOC = {
    "tags": ["Entries"],
    "summary": "Cria um novo lancamento manual ou calculado.",
    "parameters": [
        CSRF_HEADER_PARAMETER,
        {"in": "body", "name": "body", "required": True, "schema": {"$ref": "#/definitions/EntryCreateRequest"}},
    ],
    "responses": {
        "201": {"description": "Lancamento criado.", "schema": {"$ref": "#/definitions/Entry"}},
        "401": {"description": "Autenticacao obrigatoria.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
        "403": {"description": "CSRF ausente ou invalido.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
        "422": {"description": "Payload invalido.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
    },
}


GET_ENTRY_DOC = {
    "tags": ["Entries"],
    "summary": "Retorna um lancamento especifico do usuario autenticado.",
    "parameters": [{"in": "path", "name": "entry_id", "type": "integer", "required": True}],
    "responses": {
        "200": {"description": "Lancamento encontrado.", "schema": {"$ref": "#/definitions/Entry"}},
        "401": {"description": "Autenticacao obrigatoria.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
        "404": {"description": "Lancamento nao encontrado.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
    },
}


PATCH_ENTRY_DOC = {
    "tags": ["Entries"],
    "summary": "Atualiza parcialmente um lancamento existente.",
    "parameters": [
        {"in": "path", "name": "entry_id", "type": "integer", "required": True},
        CSRF_HEADER_PARAMETER,
        {"in": "body", "name": "body", "required": True, "schema": {"$ref": "#/definitions/EntryUpdateRequest"}},
    ],
    "responses": {
        "200": {"description": "Lancamento atualizado.", "schema": {"$ref": "#/definitions/Entry"}},
        "401": {"description": "Autenticacao obrigatoria.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
        "403": {"description": "CSRF ausente ou invalido.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
        "404": {"description": "Lancamento nao encontrado.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
        "422": {"description": "Payload invalido.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
    },
}


DELETE_ENTRY_DOC = {
    "tags": ["Entries"],
    "summary": "Exclui um lancamento existente.",
    "parameters": [
        {"in": "path", "name": "entry_id", "type": "integer", "required": True},
        CSRF_HEADER_PARAMETER,
    ],
    "responses": {
        "200": {"description": "Lancamento excluido.", "schema": {"$ref": "#/definitions/DeleteEntryResponse"}},
        "401": {"description": "Autenticacao obrigatoria.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
        "403": {"description": "CSRF ausente ou invalido.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
        "404": {"description": "Lancamento nao encontrado.", "schema": {"$ref": "#/definitions/ErrorResponse"}},
    },
}
