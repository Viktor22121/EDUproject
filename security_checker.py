import ast
import hashlib
from typing import Set

class SecurityChecker:
    """
    Проверка Python-кода на:
    - Импорт опасных модулей (os, subprocess, ...)
    - Вызов опасных функций (eval, exec, ...)
    - Доступ к опасным атрибутам (__globals__, __code__, ...)
    """
    def __init__(self):
        self.forbidden_modules: Set[str] = {
            'os', 'subprocess', 'sys', 'shutil',
            'ctypes', 'pickle', 'marshal', 'socket'
        }
        self.forbidden_calls: Set[str] = {
            'eval', 'exec', 'execfile', 'compile',
            'open', 'input', 'system', 'popen'
        }
        self.dangerous_attrs: Set[str] = {
            '__globals__', '__builtins__', 
            '__subclasses__', '__code__'
        }

    def is_code_safe(self, code: str) -> bool:
        """AST-анализ кода на опасные конструкции"""
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    if any(n.name in self.forbidden_modules for n in node.names):
                        return False
                elif isinstance(node, ast.ImportFrom):
                    if node.module in self.forbidden_modules:
                        return False
                elif isinstance(node, ast.Call):
                    if hasattr(node.func, 'id') and node.func.id in self.forbidden_calls:
                        return False
                elif isinstance(node, ast.Attribute):
                    if node.attr in self.dangerous_attrs:
                        return False
            return True
        except (SyntaxError, ValueError):
            return False

    @staticmethod
    def get_code_hash(code: str) -> str:
        """Генерация SHA-256 хеша для антиплагиата"""
        return hashlib.sha256(code.encode()).hexdigest()