from datetime import datetime
from functools import wraps

from flask import flash, g, redirect, request, session, url_for

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


def login_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if current_user() is None:
            flash("Entre na sua conta para continuar.", "warning")
            return redirect(url_for("web.login", next=request.path))
        return view(*args, **kwargs)

    return wrapped_view
