FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt --index-url https://pypi.org/simple/ --default-timeout=100 --trusted-host pypi.org
COPY api.py .
COPY security_checker.py .
COPY logger.py .
COPY .env .
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
