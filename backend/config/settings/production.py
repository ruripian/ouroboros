from .base import *
from decouple import config

DEBUG = False

ALLOWED_HOSTS = [h.strip() for h in config("ALLOWED_HOSTS", default="").split(",") if h.strip()]

# --- CORS ---
_cors_raw = config("CORS_ALLOWED_ORIGINS", default="")
CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_raw.split(",") if o.strip()]

# --- HTTPS / SSL ---
# DOMAIN이 설정된 경우에만 HTTPS 강제 (미설정 시 HTTP 모드로 동작)
_has_domain = bool(config("DOMAIN", default=""))
SECURE_SSL_REDIRECT = _has_domain
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# --- HSTS (DOMAIN 설정 시에만 활성화) ---
SECURE_HSTS_SECONDS = 31536000 if _has_domain else 0  # 1년 또는 비활성화
SECURE_HSTS_INCLUDE_SUBDOMAINS = _has_domain
SECURE_HSTS_PRELOAD = _has_domain

# --- 보안 헤더 ---
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# --- 쿠키 보안 ---
SESSION_COOKIE_SECURE = _has_domain  # HTTPS에서만 쿠키 전송 (DOMAIN 설정 시)
SESSION_COOKIE_HTTPONLY = True      # JavaScript에서 세션 쿠키 접근 차단
SESSION_COOKIE_SAMESITE = "Lax"    # CSRF 방어 (Lax: 외부 사이트에서 쿠키 미전송)
CSRF_COOKIE_SECURE = _has_domain    # HTTPS에서만 CSRF 쿠키 전송 (DOMAIN 설정 시)
CSRF_COOKIE_HTTPONLY = True        # JavaScript에서 CSRF 쿠키 접근 차단
CSRF_COOKIE_SAMESITE = "Lax"

# --- 세션 만료 ---
SESSION_COOKIE_AGE = 60 * 60 * 24 * 7  # 7일 (초 단위)
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
