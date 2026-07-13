from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        if not v.replace("-", "").replace("_", "").isalnum():
            raise ValueError("Username may only contain letters, numbers, hyphens and underscores")
        if len(v) < 3 or len(v) > 64:
            raise ValueError("Username must be 3–64 characters")
        return v.lower()

    @field_validator("password")
    @classmethod
    def password_valid(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    username_or_email: str
    password: str


class LoginResponse(BaseModel):
    api_key: str
    message: str = "Store your API key securely — it will not be shown again."


class RegisterResponse(BaseModel):
    username: str
    email: str
    api_key: str   # shown once — not stored in plaintext
    message: str = "Store your API key securely — it will not be shown again."


class UserOut(BaseModel):
    id: str
    username: str
    email: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ApiKeyOut(BaseModel):
    id: str
    name: str
    created_at: datetime
    last_used_at: Optional[datetime]

    model_config = {"from_attributes": True}
