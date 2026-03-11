from pathlib import Path

import click
from flasgger import Swagger
from flask import Flask
from flask.cli import with_appcontext

from .auth import load_current_user
from .api.v1.docs import SWAGGER_CONFIG, SWAGGER_TEMPLATE
from .extensions import csrf, db
from .migrations import upgrade_database
from .utils import (
    format_currency,
    format_minutes,
    format_multiplier_label,
    format_signed_minutes,
    format_time_value,
    month_label,
)


def create_app(test_config=None):
    config_overrides = dict(test_config or {})
    instance_path = config_overrides.pop("INSTANCE_PATH", None)

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
    )
    app.config.update(config_overrides)

    Path(app.instance_path).mkdir(parents=True, exist_ok=True)

    db.init_app(app)
    csrf.init_app(app)

    from . import models  # noqa: F401
    from .api.v1 import bp as api_v1_bp
    from .web import bp as web_bp

    Swagger(app, config=SWAGGER_CONFIG, template=SWAGGER_TEMPLATE)
    app.before_request(load_current_user)
    app.register_blueprint(web_bp)
    app.register_blueprint(api_v1_bp)
    csrf.exempt(api_v1_bp)
    app.cli.add_command(init_db_command)

    @app.context_processor
    def inject_template_helpers():
        return {
            "format_currency": format_currency,
            "format_minutes": format_minutes,
            "format_multiplier_label": format_multiplier_label,
            "format_signed_minutes": format_signed_minutes,
            "format_time_value": format_time_value,
            "month_label": month_label,
        }

    return app


@click.command("init-db")
@with_appcontext
def init_db_command():
    upgrade_database()
    click.echo("Banco de dados inicializado.")
