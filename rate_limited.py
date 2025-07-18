from fastapi import Request, HTTPException
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self, max_requests=30, period=15):
        self.requests = {}
        self.max_requests = max_requests  # Максимум запросов
        self.period = period  # В секундах

    async def check_limit(self, request: Request):
        ip = request.client.host
        now = datetime.now()
        
        if ip not in self.requests:
            self.requests[ip] = []
        
        # Удаляем старые запросы
        self.requests[ip] = [t for t in self.requests[ip] if now - t < timedelta(seconds=self.period)]
        
        if len(self.requests[ip]) >= self.max_requests:
            raise HTTPException(status_code=429, detail="Too Many Requests")
        
        self.requests[ip].append(now)