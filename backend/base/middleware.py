import re
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
BLOCKED_PATTERNS = [
    r"union.*select",
    r"<script>",
    r"\.\./",
    r"eval\(",
    r"__import__",
    r"os\.system",
    r"subprocess\.run",
    r"exec\(",
    r"base64",
    r"curl\b",
    r"wget\b",
    r"\brm\b",
    r"\bcat\b",
]

class SimpleWAFMiddleware(MiddlewareMixin):
    
    def process_request(self, request):
        try:
            body = (request.body or b"").decode("utf-8", errors="ignore")
            target = f"{request.path} {body}"

            if any(re.search(p, target, re.IGNORECASE) for p in BLOCKED_PATTERNS):
                return JsonResponse(
                    {"detail": "Запрос заблокирован системой безопасности"},
                    status=403
                )
            
        except UnicodeDecodeError:
            return JsonResponse(
                {"detail": "Некорректные данные в запросе"},
                status=400
            )