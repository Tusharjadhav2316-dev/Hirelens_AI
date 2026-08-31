import os
import jwt
from fastapi import HTTPException, Header
from typing import Optional

def get_jwt_secret() -> str:
    secret = os.environ.get("INTERNAL_AGENT_JWT_SECRET")
    if not secret or not secret.strip():
        raise HTTPException(
            status_code=500,
            detail="Server configuration error: INTERNAL_AGENT_JWT_SECRET is missing."
        )
    return secret.strip()

def verify_internal_jwt(x_internal_auth: Optional[str] = Header(None)) -> str:
    if not x_internal_auth:
        raise HTTPException(
            status_code=401,
            detail="Missing required authentication header: X-Internal-Auth"
        )
    
    token = x_internal_auth.strip()
    if token.lower().startswith("bearer "):
        token = token[7:].strip()
        
    if not token:
        raise HTTPException(
            status_code=401,
            detail="Authentication token is empty"
        )

    secret = get_jwt_secret()

    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            options={"require": ["exp", "iat"]}
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Internal authentication token has expired"
        )
    except jwt.InvalidAlgorithmError:
        raise HTTPException(
            status_code=401,
            detail="Invalid algorithm: token must be signed with HS256"
        )
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid internal authentication token: {str(e)}"
        )

    uid = payload.get("uid")
    sub = payload.get("sub")
    if not uid or not isinstance(uid, str) or not uid.strip():
        raise HTTPException(
            status_code=401,
            detail="Malformed token: missing or invalid uid claim"
        )
    if not sub or not isinstance(sub, str) or not sub.strip():
        raise HTTPException(
            status_code=401,
            detail="Malformed token: missing or invalid sub claim"
        )
    if uid.strip() != sub.strip():
        raise HTTPException(
            status_code=401,
            detail="Malformed token: uid and sub claims do not match"
        )

    return uid.strip()

