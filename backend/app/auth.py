from datetime import datetime

from flask import g, session

from .errors import AuthenticationError
from .extensions import db
from .models import User

SESSION_USER_ID_KEY = "user_id"


def load_current_user():
    user_id = session.get(SESSION_USER_ID_KEY)
    g.user = db.session.get(User, user_id) if user_id is not None else None


def current_user():
    return g.get("user")


def log_user_in(user):
    session.clear()
    session[SESSION_USER_ID_KEY] = user.id
    user.last_login_at = datetime.utcnow()
    db.session.commit()


def log_user_out():
    session.clear()


def require_authenticated_user():
    user = current_user()
    if user is None:
        raise AuthenticationError(
            "Autenticacao obrigatoria.",
            code="authentication_required",
        )
    return user
