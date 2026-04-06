FROM nginx:alpine

# openssl (임시 인증서 생성용) + envsubst (템플릿 치환용, 기본 포함)
RUN apk add --no-cache openssl

# 템플릿 복사
COPY templates/ /etc/nginx/templates/

# 기존 nginx.conf → 도메인 미설정 시 기본 fallback (entrypoint가 덮어씀)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 진입점 스크립트
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# ACME 챌린지용 디렉토리
RUN mkdir -p /var/www/certbot

ENTRYPOINT ["/docker-entrypoint.sh"]
