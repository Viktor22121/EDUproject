from .models import CodeFingerprint
from django.db import transaction
from difflib import SequenceMatcher
import hashlib
import ast


class DangerousCodeError(ValueError):
    pass

class PlagiarismError(ValueError):
    pass

class CodeSecurityService:

    FORBIDDEN_MODULES = {
        "os", "subprocess", "sys", "shutil", "ctypes",
        "pickle", "marshal", "socket"
    }
    FORBIDDEN_CALLS = {
        "eval", "exec", "compile", "execfile",
        "open", "system", "popen"
    }
    
    DANGEROUS_ATTRS = {"__globals__", "__builtins__", "__subclasses__", "__code__"}

    MIN_LENGTH_FOR_PLAGIARISM = 60 # от 60 символов проверяем на плагиат

    def validate(self, code, ip):
        self._check_ast(code)
        self._check_plagiarism(code)

    def _check_ast(self, code):
        try:
            tree = ast.parse(code)
        except SyntaxError as exc:
            raise DangerousCodeError(f"Синтаксическая ошибка: {exc}") from exc

        for node in ast.walk(tree):
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                for alias in node.names:
                    if alias.name.split('.')[0] in self.FORBIDDEN_MODULES:
                        raise DangerousCodeError("Импорт этого модуля запрещён")
            
            if isinstance(node, ast.Attribute):
                if node.attr in self.DANGEROUS_ATTRS:
                    raise DangerousCodeError("Обращение к запрещенному атрибуту")


    def _check_plagiarism(self, code, threshold: float = 0.9):
        code_hash = hashlib.sha256(code.encode()).hexdigest()

        if len(code) <= self.MIN_LENGTH_FOR_PLAGIARISM:
            CodeFingerprint.objects.get_or_create(
                code_hash=code_hash, defaults={"code": code}
            )
            return

        if CodeFingerprint.objects.filter(code_hash=code_hash).exists():
            raise PlagiarismError("Такое решение уже отправляли")
        
        for saved in CodeFingerprint.objects.values_list("code", flat=True):
            if SequenceMatcher(None, code, saved).ratio() >= threshold:
                raise PlagiarismError("Код слишком похож на чужой")
        
        with transaction.atomic():
            CodeFingerprint.objects.create(code_hash=code_hash, code=code)