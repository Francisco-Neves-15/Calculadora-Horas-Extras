from datetime import datetime

from pydantic import Field, field_validator, model_validator

from ..utils import normalize_email, validate_email_address
from .base import SchemaModel


class UserResponse(SchemaModel):
    id: int
    email: str
    display_name: str
    is_admin: bool
    created_at: datetime
    last_login_at: datetime | None = None


class RegisterRequest(SchemaModel):
    display_name: str = Field(min_length=2, max_length=120)
    email: str
    password: str = Field(min_length=8)
    password_confirm: str = Field(min_length=8)

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, value):
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Informe o nome de exibicao.")
        return cleaned

    @field_validator("email")
    @classmethod
    def validate_email(cls, value):
        normalized = normalize_email(value)
        if not validate_email_address(normalized):
            raise ValueError("Informe um e-mail valido.")
        return normalized

    @model_validator(mode="after")
    def validate_password_confirmation(self):
        if self.password != self.password_confirm:
            raise ValueError("As senhas precisam ser iguais.")
        return self


class LoginRequest(SchemaModel):
    email: str
    password: str = Field(min_length=1)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value):
        normalized = normalize_email(value)
        if not validate_email_address(normalized):
            raise ValueError("Informe um e-mail valido.")
        return normalized


class SessionResponse(SchemaModel):
    authenticated: bool
    user: UserResponse | None = None
    csrf_token: str
    claimed_legacy_entries: int | None = None
