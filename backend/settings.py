"""
Django settings for backend project.
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Security

# Set DJANGO_SECRET_KEY in Render Environment Variables.

SECRET_KEY = os.environ.get(
"DJANGO_SECRET_KEY",
"dev-only-key-change-me",
)

# Local development defaults; set DJANGO_DEBUG=False in production.

DEBUG = os.environ.get("DJANGO_DEBUG", "True").lower() == "true"

# Add your Render hostname to ALLOWED_HOSTS in production.

ALLOWED_HOSTS = [
host.strip()
for host in os.environ.get(
"DJANGO_ALLOWED_HOSTS",
"localhost,127.0.0.1",
).split(",")
if host.strip()
]

# Application definition

INSTALLED_APPS = [
"django.contrib.admin",
"django.contrib.auth",
"django.contrib.contenttypes",
"django.contrib.sessions",
"django.contrib.messages",
"django.contrib.staticfiles",
"corsheaders",
"rest_framework",
"research",
]

MIDDLEWARE = [
"django.middleware.security.SecurityMiddleware",
"corsheaders.middleware.CorsMiddleware",
"django.contrib.sessions.middleware.SessionMiddleware",
"django.middleware.common.CommonMiddleware",
"django.middleware.csrf.CsrfViewMiddleware",
"django.contrib.auth.middleware.AuthenticationMiddleware",
"django.contrib.messages.middleware.MessageMiddleware",
"django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
{
"BACKEND": "django.template.backends.django.DjangoTemplates",
"DIRS": [],
"APP_DIRS": True,
"OPTIONS": {
"context_processors": [
"django.template.context_processors.request",
"django.contrib.auth.context_processors.auth",
"django.contrib.messages.context_processors.messages",
],
},
},
]

WSGI_APPLICATION = "backend.wsgi.application"

# Database

DATABASES = {
"default": {
"ENGINE": "django.db.backends.sqlite3",
"NAME": BASE_DIR / "db.sqlite3",
}
}

# Password validation

AUTH_PASSWORD_VALIDATORS = [
{
"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
},
{
"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
},
{
"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
},
{
"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
},
]

# Internationalization

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Default primary key field type

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS: local development origins

CORS_ALLOWED_ORIGINS = [
"http://localhost:3000",
"http://127.0.0.1:3000",
]
# Production security settings

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True