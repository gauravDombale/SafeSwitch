class DomainError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

class FlagAlreadyExistsError(DomainError):
    def __init__(self, flag_name: str):
        super().__init__(f"A flag with the name '{flag_name}' already exists.", 409)

class FlagNotFoundError(DomainError):
    def __init__(self):
        super().__init__("The requested feature flag could not be found.", 404)
