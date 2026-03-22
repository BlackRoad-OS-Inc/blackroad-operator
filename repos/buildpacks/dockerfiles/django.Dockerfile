FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt* ./
RUN pip install --no-cache-dir -r requirements.txt 2>/dev/null || true
RUN pip install --no-cache-dir gunicorn
COPY . .
RUN python manage.py collectstatic --noinput 2>/dev/null || true
ENV PORT=3000
EXPOSE 3000
CMD ["gunicorn", "--bind", "0.0.0.0:3000", "--workers", "2", "config.wsgi:application"]
