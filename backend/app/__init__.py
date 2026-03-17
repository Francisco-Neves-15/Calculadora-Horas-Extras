import os
from pathlib import Path

import click
from flasgger import Swagger
from flask import Flask
from flask.cli import with_appcontext
from flask_cors import CORS

from .auth import load_current_user
from .api.v1.docs import SWAGGER_CONFIG, SWAGGER_TEMPLATE
from .extensions import csrf, db
from .migrations import upgrade_database


def _env_bool(name, default):
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_csv(name, default):
    value = os.getenv(name)
    raw = default if value is None else value
    items = [item.strip() for item in raw.split(",")]
    return [item for item in items if item]


def create_app(test_config=None):
    config_overrides = dict(test_config or {})
    instance_path = config_overrides.pop("INSTANCE_PATH", None)
    app_env = os.getenv("APP_ENV", "development").strip().lower()
    is_production = app_env == "production"

    app = Flask(
        __name__,
        instance_relative_config=True,
        instance_path=instance_path,
    )

    default_db_path = Path(app.instance_path) / "horas_extras.db"
    app.config.from_mapping(
        SECRET_KEY="dev-local-secret",
        SQLALCHEMY_DATABASE_URI=f"sqlite:///{default_db_path}",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        DEFAULT_WEEKDAY_EXPECTED_MINUTES=480,
        DEFAULT_SATURDAY_EXPECTED_MINUTES=0,
        DEFAULT_SUNDAY_EXPECTED_MINUTES=0,
        DEFAULT_WEEKDAY_OVERTIME_MULTIPLIER=1.5,
        DEFAULT_SATURDAY_OVERTIME_MULTIPLIER=1.5,
        DEFAULT_SUNDAY_WORK_MULTIPLIER=2.0,
        APP_ENV=app_env,
        ENABLE_SWAGGER=_env_bool("ENABLE_SWAGGER", not is_production),
        CORS_ALLOWED_ORIGINS=_env_csv("CORS_ALLOWED_ORIGINS", "http://localhost:5173"),
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SECURE=_env_bool("SESSION_COOKIE_SECURE", is_production),
        SESSION_COOKIE_SAMESITE=os.getenv("SESSION_COOKIE_SAMESITE", "None" if is_production else "Lax"),
    )
    app.config.update(config_overrides)

    Path(app.instance_path).mkdir(parents=True, exist_ok=True)

    db.init_app(app)
    csrf.init_app(app)

    from . import models  # noqa: F401
    from .api.v1 import bp as api_v1_bp

    if app.config["ENABLE_SWAGGER"]:
        Swagger(app, config=SWAGGER_CONFIG, template=SWAGGER_TEMPLATE)

    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ALLOWED_ORIGINS"]}},
        supports_credentials=True,
        allow_headers=["Content-Type", "X-CSRF-Token"],
        methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    )

    app.before_request(load_current_user)
    app.register_blueprint(api_v1_bp)
    csrf.exempt(api_v1_bp)
    app.cli.add_command(init_db_command)

    return app


@click.command("init-db")
@with_appcontext
def init_db_command():
    upgrade_database()
    click.echo("Banco de dados inicializado.")
