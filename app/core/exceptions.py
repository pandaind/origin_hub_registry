from fastapi import HTTPException, status


class HubException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


class ResourceAlreadyExistsException(HubException):
    def __init__(self, resource_name: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{resource_name} already exists."
        )


class ResourceNotFoundException(HubException):
    def __init__(self, resource_name: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource_name} not found."
        )
