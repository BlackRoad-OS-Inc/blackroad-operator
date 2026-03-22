FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir poetry==1.8.0
COPY pyproject.toml ./
RUN poetry config virtualenvs.create false && poetry install --no-dev --no-root
COPY app ./app
RUN useradd -m -u 1000 bususer && chown -R bususer:bususer /app
USER bususer
EXPOSE 8002
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
