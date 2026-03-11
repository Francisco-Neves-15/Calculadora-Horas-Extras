from pathlib import Path

from alembic import command
from alembic.config import Config
from flask import current_app


def alembic_config():
    root_path = Path(__file__).resolve().parents[1]
    config = Config(str(root_path / "alembic.ini"))
    config.set_main_option("script_location", str(root_path / "alembic"))
    config.set_main_option("sqlalchemy.url", current_app.config["SQLALCHEMY_DATABASE_URI"])
    return config


def upgrade_database(revision="head"):
    command.upgrade(alembic_config(), revision)
