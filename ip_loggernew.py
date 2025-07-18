import json
import hashlib
from datetime import datetime

class CodeSecurityService:
    def __init__(self, log_file: str):
        self.log_file = log_file
        self.db_file = "/app/hashes_db.json"
        self.load_db()

    def load_db(self):
        try:
            with open(self.db_file, "r") as f:
                self.db = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self.db = {"hashes": [], "codes": []}
            self.save_db()

    def save_db(self):
        with open(self.db_file, "w") as f:
            json.dump(self.db, f, indent=2)

    def log_submission(self, code: str, ip: str) -> str:
        code_hash = hashlib.sha256(code.encode()).hexdigest()
        if code_hash in self.db["hashes"]:
            raise ValueError("Обнаружено похожее решение")
        self.db["hashes"].append(code_hash)
        self.db["codes"].append(code)
        self.save_db()
        with open(self.log_file, "a") as f:
            f.write(f"{datetime.utcnow()} | {ip} | {code_hash}\n")
        return code_hash
