import ast
import hashlib
from datetime import datetime
from typing import Set, Dict, List
import json
import os
from difflib import SequenceMatcher

class CodeSecurityService:
    """
    Система антиплагиата:
    - Логирует отправки кода (формат: timestamp | IP | хеш)
    - Сравнивает код через difflib (порог схожести: 90%)
    - Хранит историю в hashes_db.json
    """
    def __init__(self, log_file: str = "submissions.log", plagiarism_db: str = "hashes_db.json"):
        self.forbidden_modules = {'os', 'subprocess', 'sys', 'shutil', 'ctypes', 'pickle', 'marshal', 'socket'}
        self.forbidden_calls = {'eval', 'exec', 'execfile', 'compile', 'open', 'input', 'system', 'popen'}
        self.dangerous_attrs = {'__globals__', '__builtins__', '__subclasses__', '__code__'}
        self.log_file = log_file
        self.plagiarism_db = plagiarism_db
        self._init_db()

    def _init_db(self):
        if not os.path.exists(self.plagiarism_db):
            with open(self.plagiarism_db, 'w') as f:
                json.dump({"hashes": [], "codes": []}, f)

    def _check_plagiarism(self, code: str, code_hash: str, threshold: float = 0.9) -> bool:
        with open(self.plagiarism_db, 'r+') as f:
            data = json.load(f)
            if code_hash in data["hashes"]:
                return True
            
            for saved_code in data["codes"]:
                similarity = SequenceMatcher(None, code, saved_code).ratio()
                if similarity >= threshold:
                    return True
            
            data["hashes"].append(code_hash)
            data["codes"].append(code)
            f.seek(0)
            json.dump(data, f)
            return False

    def log_submission(self, code: str, ip: str) -> str:
        code_hash = hashlib.sha256(code.encode()).hexdigest()
        with open(self.log_file, 'a') as f:
            f.write(f"{datetime.now()} | {ip} | {code_hash}\n")
        
        if self._check_plagiarism(code, code_hash):
            raise ValueError("Обнаружено похожее решение")
        return code_hash