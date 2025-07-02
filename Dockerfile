# ChainGate Multi-Service Docker Container
# This Dockerfile builds and runs both the Django API and Next.js frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY access-portal/package*.json ./
RUN npm ci --only=production
COPY access-portal/ ./
RUN npm run build
FROM python:3.9-slim
RUN apt-get update && apt-get install -y \
    curl \
    supervisor \
    nginx \
    && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV NODE_ENV=production
WORKDIR /app
COPY chain-api/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY chain-api/ ./backend/
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules
COPY access-portal/next.config.mjs ./frontend/
COPY access-portal/tailwind.config.ts ./frontend/

RUN mkdir -p /var/log/supervisor
COPY <<EOF /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:django]
command=python manage.py runserver 0.0.0.0:8000
directory=/app/backend
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/django.err.log
stdout_logfile=/var/log/supervisor/django.out.log
environment=PYTHONPATH="/app/backend"

[program:nextjs]
command=npm start
directory=/app/frontend
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/nextjs.err.log
stdout_logfile=/var/log/supervisor/nextjs.out.log

[program:nginx]
command=/usr/sbin/nginx -g "daemon off;"
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/nginx.err.log
stdout_logfile=/var/log/supervisor/nginx.out.log
EOF

# Copy nginx configuration
COPY <<EOF /etc/nginx/sites-available/default
server {
    listen 80;
    server_name localhost;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # API (Django)
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Admin interface
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files for Django admin
    location /static/ {
        proxy_pass http://localhost:8000;
    }
}
EOF

# Copy startup script
COPY <<EOF /app/start.sh
#!/bin/bash

echo "Starting ChainGate Services..."

# Wait for database connections to be ready
echo "Waiting for database connections..."
sleep 10

# Run Django migrations
echo "Running Django migrations..."
cd /app/backend
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if it doesn't exist
echo "Setting up admin user..."
python manage.py shell << 'PYTHON_EOF'
import os
from django.contrib.auth import get_user_model

User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@chaingate.com', 'admin123')
    print("Admin user created: admin / admin123")
else:
    print("Admin user already exists")
PYTHON_EOF

# Start supervisor (which starts all services)
echo "Starting all services with supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
EOF

# Make startup script executable
RUN chmod +x /app/start.sh

# Create environment file template
COPY <<EOF /app/.env.template
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# MongoDB Configuration
MONGODB_USER=chaingate_user
MONGODB_PASSWORD=chaingate_password
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/
MONGODB_DATABASE_NAME=chaingate

# MongoDB Collections
MONGODB_COLLECTION_USERS=users
MONGODB_COLLECTION_CARDS=cards
MONGODB_COLLECTION_ADMIN=admin
MONGODB_COLLECTION_ACCESSLOG=accesslog
MONGODB_COLLECTION_ACCESS_LEVELS=access_levels
MONGODB_COLLECTION_ALERTCONFIG=alertconfig
MONGODB_COLLECTION_DEVICES=devices
MONGODB_COLLECTION_SETTINGS=settings

# Blockchain Configuration
BLOCKCHAIN_PROVIDER=http://127.0.0.1:8545
BLOCKCHAIN_ACCOUNT_INDEX=0
BLOCKCHAIN_NETWORK=testnet

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_APP_NAME=ChainGate Access Portal
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_BLOCKCHAIN=true
NEXT_PUBLIC_ENABLE_AI_ASSISTANT=true
NEXT_PUBLIC_ENABLE_REAL_TIME=true
EOF

# Copy health check script
COPY <<EOF /app/health_check.sh
#!/bin/bash

# Check Django API
django_health=\$(curl -f http://localhost:8000/api/health/ 2>/dev/null || echo "DOWN")

# Check Next.js frontend
nextjs_health=\$(curl -f http://localhost:3000 2>/dev/null || echo "DOWN")

# Check nginx
nginx_health=\$(curl -f http://localhost/ 2>/dev/null || echo "DOWN")

echo "Django API: \$django_health"
echo "Next.js Frontend: \$nextjs_health"
echo "Nginx Proxy: \$nginx_health"

if [[ "\$django_health" == "DOWN" || "\$nextjs_health" == "DOWN" || "\$nginx_health" == "DOWN" ]]; then
    exit 1
else
    echo "All services are healthy"
    exit 0
fi
EOF

RUN chmod +x /app/health_check.sh

# Expose ports
EXPOSE 80 3000 8000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /app/health_check.sh

# Set working directory
WORKDIR /app

# Start the application
CMD ["/app/start.sh"]

# Metadata
LABEL maintainer="ChainGate Team"
LABEL version="1.0.0"
LABEL description="ChainGate Access Control System - Full Stack Container"