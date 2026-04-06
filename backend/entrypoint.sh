#!/bin/sh
# ── DB 연결 대기 ──
# depends_on: service_healthy로 DB 시작은 보장되지만,
# Docker 네트워크 초기화 타이밍에 따라 DNS 해석이 지연될 수 있음.
# Python으로 직접 연결 시도하여 안정적으로 대기.

echo "Waiting for database..."
MAX_RETRIES=15
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
  python -c "
import django, sys
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()
from django.db import connection
connection.ensure_connection()
" 2>/dev/null && break
  RETRY=$((RETRY + 1))
  echo "  DB not ready (attempt $RETRY/$MAX_RETRIES)..."
  sleep 2
done

if [ $RETRY -eq $MAX_RETRIES ]; then
  echo "ERROR: Could not connect to database after $MAX_RETRIES attempts"
  exit 1
fi

echo "Database ready!"

# 마이그레이션 실행
python manage.py migrate --noinput

exec "$@"
