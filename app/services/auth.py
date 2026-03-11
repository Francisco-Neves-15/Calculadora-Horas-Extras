from collections.abc import Mapping

from sqlalchemy import select

from ..errors import AuthenticationError, ValidationError
from ..extensions import db
from ..models import User
from ..utils import normalize_email, validate_email_address
from .settings import build_user_settings, claim_legacy_records


def users_exist():
    return db.session.execute(select(User.id).limit(1)).first() is not None


def register_user(display_name, email, password, defaults: Mapping[str, object]):
    normalized_email = normalize_email(email)
    if not validate_email_address(normalized_email):
        raise ValidationError(
            "Informe um e-mail valido.",
            code="invalid_email",
            details={"field": "email"},
        )

    email_exists = db.session.execute(
        select(User.id).where(User.email == normalized_email)
    ).first()
    if email_exists is not None:
        raise ValidationError(
            "Ja existe uma conta com esse e-mail.",
            code="email_already_used",
            details={"field": "email"},
        )

    first_user = not users_exist()
    user = User(
        email=normalized_email,
        display_name=display_name.strip(),
        is_admin=first_user,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    if first_user:
        _, claimed_entries = claim_legacy_records(user, defaults)
    else:
        db.session.add(build_user_settings(user.id, defaults))
        claimed_entries = 0

    db.session.commit()
    return user, claimed_entries


def authenticate_user(email, password):
    normalized_email = normalize_email(email)
    user = db.session.execute(
        select(User).where(User.email == normalized_email)
    ).scalars().first()

    if user is None or not user.check_password(password):
        raise AuthenticationError(
            "E-mail ou senha invalidos.",
            code="invalid_credentials",
        )
    return user
