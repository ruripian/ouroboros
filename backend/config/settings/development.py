from .base import *

DEBUG = True

ALLOWED_HOSTS = ["*"]

CORS_ALLOW_ALL_ORIGINS = True

INSTALLED_APPS += ["debug_toolbar"] if False else []

# 개발 환경: 이메일을 실제 발송하지 않고 Django 콘솔(서버 터미널)에 출력 (단, .env에서 덮어쓰지 않은 경우에만)
EMAIL_BACKEND = config("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
