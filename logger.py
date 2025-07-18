import json
import hashlib
import os
from datetime import datetime

class SubmissionLogger:
    def __init__(self):
        self.db_file = "/app/hashes_db.json"
        self.log_file = "/app/submissions.log"

    def log_submission(self, code: str, ip: str) -> str:
        code_hash = hashlib.sha256(code.encode()).hexdigest()
        timestamp = datetime.utcnow().isoformat()
        
        # Log to submissions.log
        with open(self.log_file, "a") as f:
            f.write(f"{timestamp} - IP: {ip} - Hash: {code_hash}\n")
        
        # Check and update hashes_db.json
        try:
            with open(self.db_file, "r") as f:
                db = json.load(f)
        except FileNotFoundError:
            db = {}
        
        if code_hash in db:
            raise ValueError("Обнаружено похожее решение")
        
        db[code_hash] = {"timestamp": timestamp, "ip": ip}
        with open(self.db_file, "w") as f:
            json.dump(db, f, indent=2)
        
        return code_hash
