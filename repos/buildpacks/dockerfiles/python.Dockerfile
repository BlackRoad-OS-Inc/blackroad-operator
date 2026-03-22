FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt* pyproject.toml* setup.py* Pipfile* ./
RUN pip install --no-cache-dir -r requirements.txt 2>/dev/null || \
    pip install --no-cache-dir . 2>/dev/null || \
    pip install --no-cache-dir pipenv && pipenv install --system 2>/dev/null || true
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["python", "main.py"]
