class AppError(Exception):
    def __init__(self, message, *, code="app_error", status_code=400, details=None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}

    def to_dict(self):
        return {
            "code": self.code,
            "message": self.message,
            "details": self.details,
        }


class ValidationError(AppError):
    def __init__(self, message, *, code="validation_error", details=None):
        super().__init__(message, code=code, status_code=422, details=details)


class AuthenticationError(AppError):
    def __init__(self, message, *, code="authentication_error", details=None):
        super().__init__(message, code=code, status_code=401, details=details)


class AuthorizationError(AppError):
    def __init__(self, message, *, code="authorization_error", details=None):
        super().__init__(message, code=code, status_code=403, details=details)


class NotFoundError(AppError):
    def __init__(self, message, *, code="not_found", details=None):
        super().__init__(message, code=code, status_code=404, details=details)
