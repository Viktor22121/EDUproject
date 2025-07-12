from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse
from jose import jwt, JWTError
from datetime import datetime, timedelta
import re
import os
from dotenv import load_dotenv
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from security_checker import SecurityChecker

# Инициализация
load_dotenv()
app = FastAPI(title="Education Platform API", docs_url="/docs")
security = HTTPBearer()
checker = SecurityChecker()

# Конфигурация
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # Фиксированный срок JWT

# Rate Limiting (10 запросов в минуту)
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda _, exc: JSONResponse(
    {"error": "Too many requests (максимум 10/мин)"}, 
    status_code=status.HTTP_429_TOO_MANY_REQUESTS
))

# WAF (Web Application Firewall)
BLOCKED_PATTERNS = [
    r"union.*select", r"<script>", r"\.\./",
    r"eval\(", r"__import__", r"os\.system",
    r"subprocess\.run", r"exec\(", r"base64",
    r"curl", r"wget", r"\brm\b", r"\bcat\b"
]

@app.middleware("http")
async def waf_middleware(request: Request, call_next):
    """Блокирует SQLi, XSS, RCE-атаки через регулярные выражения."""
    try:
        body = await request.body()
        text = f"{request.url} {body.decode('utf-8', errors='ignore')}"
        if any(re.search(p, text, re.IGNORECASE) for p in BLOCKED_PATTERNS):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Запрос заблокирован системой безопасности"
            )
        return await call_next(request)
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Некорректные данные в запросе"
        )

# JWT + RBAC
def create_token(role: str, user_id: str):
    """Генерация JWT токена с указанной ролью."""
    payload = {
        "role": role,
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(security)):
    """Проверка валидности JWT токена."""
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный или просроченный токен"
        )

# Эндпоинты
@app.post("/check-code", summary="Проверка кода на безопасность")
@limiter.limit("10/minute")
async def check_code(
    request: Request,
    code: str,
    user: dict = Depends(get_current_user)
):
    """
    Проверяет код на:
    - Опасные операции (через SecurityChecker)
    - Лимит: 10 запросов в минуту
    """
    if not checker.is_code_safe(code):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Код содержит опасные конструкции"
        )
    return {"status": "ok", "user_id": user["user_id"]}

@app.post("/admin", summary="Административный эндпоинт")
async def admin_route(user: dict = Depends(get_current_user)):
    """Только для пользователей с ролью 'admin'."""
    if user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав"
        )
    return {"message": "Доступ разрешен"}

@app.get("/token", summary="Получить тестовый JWT токен")
async def generate_test_token():
    """Генерация тестового токена (role=user, expires_in=15 мин)."""
    return {"token": create_token("user", "test-id")}