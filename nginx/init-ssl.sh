#!/bin/bash
# ═══════════════════════════════════════════════════
# Let's Encrypt 최초 인증서 발급 스크립트
#
# 사용법:
#   1. .env에 DOMAIN=your-domain.com 설정
#   2. docker compose -f docker-compose.prod.yml up -d nginx
#   3. ./scripts/init-ssl.sh
#   4. docker compose -f docker-compose.prod.yml up -d
#
# 이후 갱신은 certbot 컨테이너가 12시간마다 자동 처리
# ═══════════════════════════════════════════════════
set -e

# .env 파일에서 DOMAIN 읽기
if [ -f .env ]; then
    export $(grep -E '^DOMAIN=' .env | xargs)
fi

if [ -z "$DOMAIN" ]; then
    echo "❌ DOMAIN이 설정되지 않았습니다."
    echo "   .env 파일에 DOMAIN=your-domain.com 을 추가하세요."
    exit 1
fi

# .env에서 이메일 읽기 (Let's Encrypt 만료 알림용)
if [ -f .env ]; then
    export $(grep -E '^CERTBOT_EMAIL=' .env | xargs)
fi

EMAIL_FLAG=""
if [ -n "$CERTBOT_EMAIL" ]; then
    EMAIL_FLAG="--email $CERTBOT_EMAIL"
else
    EMAIL_FLAG="--register-unsafely-without-email"
    echo "⚠️  CERTBOT_EMAIL 미설정 — 이메일 없이 발급합니다."
    echo "   만료 알림을 받으려면 .env에 CERTBOT_EMAIL=you@example.com 을 추가하세요."
fi

echo "🔐 Let's Encrypt 인증서 발급 시작: $DOMAIN"

# certbot으로 최초 발급
docker compose -f docker-compose.prod.yml run --rm certbot \
    certbot certonly \
    --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" \
    $EMAIL_FLAG \
    --agree-tos \
    --no-eff-email \
    --force-renewal

echo "✅ 인증서 발급 완료!"
echo ""
echo "nginx를 재시작하여 인증서를 적용합니다..."
docker compose -f docker-compose.prod.yml restart nginx

echo "🎉 HTTPS 활성화 완료: https://$DOMAIN"
