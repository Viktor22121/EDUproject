from fastapi import FastAPI, Depends, HTTPException, status, Request
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
import os
from security_checker import CodeSecurityChecker
from logger import SubmissionLogger
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import timedelta, datetime
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Starting application")
# Прямое задание SECRET_KEY
SECRET_KEY = "g19oqSb43xeT7k82EpvU5iPmGr06aMhc"
logger.info(f"SECRET_KEY set: {SECRET_KEY}")
# Альтернатива: чтение .env вручную
try:
    with open("/app/.env", "r") as f:
        for line in f:
            if line.strip().startswith("SECRET_KEY="):
                SECRET_KEY = line.strip().split("=", 1)[1]
                logger.info(f"SECRET_KEY from .env: {SECRET_KEY}")
except Exception as e:
    logger.warning(f"Failed to read .env: {str(e)}")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY not found")
ALGORITHM = "HS256"

app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
checker = CodeSecurityChecker()
logger_submission = SubmissionLogger()
security = HTTPBearer()

class CodeRequest(BaseModel):
    code: str

def create_token(role: str, user_id: str):
    logger.info(f"Creating token for role={role}, user_id={user_id}")
    to_encode = {"sub": user_id, "role": role, "exp": datetime.utcnow() + timedelta(hours=1)}
    try:
        token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        logger.info(f"Token created: {token}")
        return token
    except Exception as e:
        logger.error(f"Error creating token: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Token creation failed: {str(e)}")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        logger.info(f"Decoded user: {payload}")
        return {"user_id": payload.get("sub"), "role": payload.get("role")}
    except JWTError as e:
        logger.error(f"JWTError: {str(e)}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@app.get("/token", summary="Получить тестовый JWT токен")
async def generate_test_token():
    logger.info("Generating test token")
    token = create_token("user", "test-id")
    logger.info(f"Generated token: {token}")
    return {"token": token}

@app.get("/admin-token", summary="Получить тестовый JWT токен для админа")
async def generate_admin_token():
    logger.info("Generating admin token")
    token = create_token("admin", "admin-id")
    logger.info(f"Generated admin token: {token}")
    return {"token": token}

@app.post("/check-code", summary="Проверка кода на безопасность")
@limiter.limit("10/minute")
async def check_code(
    request: Request,
    code_request: CodeRequest,
    user: dict = Depends(get_current_user)
):
    logger.info(f"Received request: code={code_request.code}, ip={request.client.host}")
    ip = request.client.host
    try:
        logger.info("Calling log_submission")
        hash_value = logger_submission.log_submission(code_request.code, ip)
        logger.info(f"Log_submission returned: {hash_value}")
        logger.info("Calling is_code_safe")
        if not checker.is_code_safe(code_request.code):
            logger.info("Code is unsafe")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Код содержит опасные конструкции"
            )
        logger.info("Returning response")
        return {"status": "ok", "user_id": user["user_id"], "hash": hash_value}
    except ValueError as e:
        logger.error(f"ValueError: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException as e:
        logger.error(f"HTTPException: {str(e)}")
        raise e  # Пропускаем HTTPException без обёртывания
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected server error"
        )

@app.post("/admin", summary="Админский эндпоинт")
async def admin_endpoint(user: dict = Depends(get_current_user)):
    logger.info(f"Admin endpoint accessed by user: {user}")
    if user["role"] != "admin":
        logger.info("User is not admin")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недостаточно прав")
    logger.info("Admin access granted")
    return {"message": "Доступ разрешен"}
