import ast

class CodeSecurityChecker:
    def __init__(self):
        self.dangerous_functions = {'os.system', 'subprocess.run', 'eval', 'exec'}

    def is_code_safe(self, code: str) -> bool:
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Name):
                        if node.func.id in self.dangerous_functions:
                            return False
                    elif isinstance(node.func, ast.Attribute):
                        if f"{node.func.value.id}.{node.func.attr}" in self.dangerous_functions:
                            return False
            return True
        except SyntaxError:
            return False
