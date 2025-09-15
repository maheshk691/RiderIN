# 🚀 RiderIN Server Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the RiderIN application (Server API and Socket Server) on a Linux VM. It covers VM setup, database installation, application deployment, configuration, monitoring, and maintenance.

## 📋 Table of Contents

1. [VM Requirements & Setup](#vm-requirements--setup)
2. [System Dependencies](#system-dependencies)
3. [Database Installation & Configuration](#database-installation--configuration)
4. [Application Deployment](#application-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Process Management](#process-management)
7. [Reverse Proxy Setup](#reverse-proxy-setup)
8. [SSL Certificate Configuration](#ssl-certificate-configuration)
9. [Monitoring & Logging](#monitoring--logging)
10. [Backup & Recovery](#backup--recovery)
11. [Security Hardening](#security-hardening)
12. [Maintenance & Updates](#maintenance--updates)
13. [Troubleshooting](#troubleshooting)

## 🖥️ VM Requirements & Setup

### Minimum System Requirements

#### Production Server
- **CPU**: 4 cores (2.4 GHz or higher)
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 100GB SSD (for OS, applications, logs)
- **Network**: 1 Gbps connection
- **OS**: Ubuntu 20.04 LTS or CentOS 8+

#### Development Server
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **Network**: 100 Mbps connection
- **OS**: Ubuntu 20.04 LTS

### VM Setup Commands

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git vim htop unzip software-properties-common

# Create application user
sudo useradd -m -s /bin/bash RiderIN
sudo usermod -aG sudo RiderIN

# Create application directories
sudo mkdir -p /opt/RiderIN/{server,socket,logs,backups}
sudo chown -R RiderIN:RiderIN /opt/RiderIN

# Set up firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000  # Server API
sudo ufw allow 8080  # Socket Server
```

## 🔧 System Dependencies

### Node.js Installation

```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 globally for process management
sudo npm install -g pm2
```

### MongoDB Installation

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
sudo systemctl status mongod
```

### Redis Installation (Optional - for caching)

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo vim /etc/redis/redis.conf

# Update configuration
# bind 127.0.0.1
# requirepass your_redis_password
# maxmemory 256mb
# maxmemory-policy allkeys-lru

# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test Redis connection
redis-cli ping
```

### Nginx Installation (Reverse Proxy)

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify installation
sudo systemctl status nginx
```

## 🗄️ Database Installation & Configuration

### MongoDB Configuration

```bash
# Create MongoDB configuration file
sudo vim /etc/mongod.conf

# Update configuration
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod
```

### Database Setup

```bash
# Connect to MongoDB
mongosh

# Create database and user
use RiderIN

# Create application user
db.createUser({
  user: "RiderIN_user",
  pwd: "your_secure_password",
  roles: [
    { role: "readWrite", db: "RiderIN" }
  ]
})

# Create indexes for better performance
db.users.createIndex({ "phone_number": 1 }, { unique: true })
db.users.createIndex({ "email": 1 }, { unique: true, sparse: true })
db.drivers.createIndex({ "phone_number": 1 }, { unique: true })
db.drivers.createIndex({ "email": 1 }, { unique: true })
db.drivers.createIndex({ "registration_number": 1 }, { unique: true })
db.rides.createIndex({ "userId": 1 })
db.rides.createIndex({ "driverId": 1 })
db.rides.createIndex({ "status": 1 })
db.rides.createIndex({ "cratedAt": -1 })

# Exit MongoDB
exit
```

## 🚀 Application Deployment

### Server API Deployment

```bash
# Switch to application user
sudo su - RiderIN

# Navigate to application directory
cd /opt/RiderIN/server

# Clone repository (or upload files)
git clone https://github.com/your-repo/RiderIN.git .
# OR upload your server files to /opt/RiderIN/server

# Install dependencies
npm install

# Build TypeScript
npm run build

# Create environment file
cat > .env << EOF
# Database Configuration
DATABASE_URL="mongodb://RiderIN_user:your_secure_password@localhost:27017/RiderIN?authSource=RiderIN"

# JWT Configuration
ACCESS_TOKEN_SECRET="your_super_secure_jwt_secret_key_here"
EMAIL_ACTIVATION_SECRET="your_email_activation_secret_key_here"

# Twilio Configuration
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_SERVICE_SID="your_twilio_service_sid"

# Nylas Configuration
NYLAS_API_KEY="your_nylas_api_key"
USER_GRANT_ID="your_nylas_grant_id"

# Server Configuration
PORT=3000
NODE_ENV=production

# Redis Configuration (if using)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="your_redis_password"
EOF

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Test the application
npm start
```

### Socket Server Deployment

```bash
# Navigate to socket directory
cd /opt/RiderIN/socket

# Clone or upload socket server files
# Upload your socket server files to /opt/RiderIN/socket

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
# Socket Server Configuration
PORT=8080
HTTP_PORT=3001

# Database Configuration (if using database)
MONGODB_URI="mongodb://ridewave_user:your_secure_password@localhost:27017/ridewave?authSource=ridewave"

# Redis Configuration
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="your_redis_password"

# Security
JWT_SECRET="your_jwt_secret_for_socket_auth"

# Monitoring
PROMETHEUS_PORT=9090
EOF

# Test the socket server
npm start
```

## ⚙️ Environment Configuration

### Production Environment Variables

#### Server API (.env)
```bash
# Database
DATABASE_URL="mongodb://ridewave_user:your_secure_password@localhost:27017/ridewave?authSource=ridewave"

# JWT Secrets (Generate strong secrets)
ACCESS_TOKEN_SECRET="your_super_secure_jwt_secret_key_here_minimum_32_characters"
EMAIL_ACTIVATION_SECRET="your_email_activation_secret_key_here_minimum_32_characters"

# Twilio SMS Service
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_SERVICE_SID="your_twilio_service_sid"

# Nylas Email Service
NYLAS_API_KEY="your_nylas_api_key"
USER_GRANT_ID="your_nylas_grant_id"

# Server Configuration
PORT=3000
NODE_ENV=production

# Redis (Optional)
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="your_redis_password"

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
```

#### Socket Server (.env)
```bash
# Socket Configuration
PORT=8080
HTTP_PORT=3001

# Database (if using persistent storage)
MONGODB_URI="mongodb://ridewave_user:your_secure_password@localhost:27017/ridewave?authSource=ridewave"

# Redis for caching
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="your_redis_password"

# Security
JWT_SECRET="your_jwt_secret_for_socket_auth"

# Monitoring
PROMETHEUS_PORT=9090
LOG_LEVEL=info
```

## 🔄 Process Management

### PM2 Configuration

#### Server API PM2 Config
```bash
# Create PM2 ecosystem file
cat > /opt/ridewave/server/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'ridewave-server',
    script: './build/server.js',
    cwd: '/opt/ridewave/server',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/opt/ridewave/logs/server-error.log',
    out_file: '/opt/ridewave/logs/server-out.log',
    log_file: '/opt/ridewave/logs/server-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
```

#### Socket Server PM2 Config
```bash
# Create PM2 ecosystem file for socket server
cat > /opt/ridewave/socket/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'ridewave-socket',
    script: './server.js',
    cwd: '/opt/ridewave/socket',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: '/opt/ridewave/logs/socket-error.log',
    out_file: '/opt/ridewave/logs/socket-out.log',
    log_file: '/opt/ridewave/logs/socket-combined.log',
    time: true,
    max_memory_restart: '512M',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
```

### Start Applications with PM2

```bash
# Start server API
cd /opt/ridewave/server
pm2 start ecosystem.config.js

# Start socket server
cd /opt/ridewave/socket
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ridewave --hp /home/ridewave

# Check status
pm2 status
pm2 logs
```

## 🌐 Reverse Proxy Setup

### Nginx Configuration

```bash
# Create Nginx configuration
sudo vim /etc/nginx/sites-available/ridewave

# Add configuration
upstream ridewave_api {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001 backup;
}

upstream ridewave_socket {
    server 127.0.0.1:8080;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # API routes
    location /api/ {
        proxy_pass http://ridewave_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # WebSocket routes
    location /socket/ {
        proxy_pass http://ridewave_socket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://ridewave_api;
        access_log off;
    }
    
    # Static files (if any)
    location /static/ {
        alias /opt/ridewave/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Logging
    access_log /var/log/nginx/ridewave_access.log;
    error_log /var/log/nginx/ridewave_error.log;
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/ridewave /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL Certificate Configuration

### Let's Encrypt SSL Setup

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run

# Setup automatic renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## 📊 Monitoring & Logging

### Log Management

```bash
# Setup log rotation
sudo vim /etc/logrotate.d/ridewave

# Add configuration
/opt/ridewave/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 ridewave ridewave
    postrotate
        pm2 reloadLogs
    endscript
}

# Setup log monitoring
sudo apt install -y logwatch
sudo vim /etc/logwatch/conf/logwatch.conf

# Update configuration
MailTo = admin@your-domain.com
MailFrom = logs@your-domain.com
Detail = Med
Service = All
```

### System Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Setup system monitoring script
cat > /opt/ridewave/scripts/monitor.sh << 'EOF'
#!/bin/bash

# System monitoring script
LOG_FILE="/opt/ridewave/logs/system-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check system resources
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f"), $3/$2 * 100.0}')
DISK_USAGE=$(df -h / | awk 'NR==2{printf "%s", $5}' | sed 's/%//')

# Check application status
PM2_STATUS=$(pm2 jlist | jq -r '.[] | select(.name | contains("ridewave")) | .pm2_env.status' | head -1)

# Check MongoDB
MONGO_STATUS=$(systemctl is-active mongod)

# Check Redis (if installed)
REDIS_STATUS=$(systemctl is-active redis-server 2>/dev/null || echo "not-installed")

# Log status
echo "[$DATE] CPU: ${CPU_USAGE}%, Memory: ${MEMORY_USAGE}%, Disk: ${DISK_USAGE}%, PM2: ${PM2_STATUS}, MongoDB: ${MONGO_STATUS}, Redis: ${REDIS_STATUS}" >> $LOG_FILE

# Alert if resources are high
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "[$DATE] ALERT: High CPU usage: ${CPU_USAGE}%" >> $LOG_FILE
fi

if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "[$DATE] ALERT: High Memory usage: ${MEMORY_USAGE}%" >> $LOG_FILE
fi

if [ "$DISK_USAGE" -gt 80 ]; then
    echo "[$DATE] ALERT: High Disk usage: ${DISK_USAGE}%" >> $LOG_FILE
fi
EOF

chmod +x /opt/ridewave/scripts/monitor.sh

# Setup cron job for monitoring
echo "*/5 * * * * /opt/ridewave/scripts/monitor.sh" | crontab -u ridewave -
```

### Application Health Checks

```bash
# Create health check script
cat > /opt/ridewave/scripts/health-check.sh << 'EOF'
#!/bin/bash

# Health check script
API_URL="http://localhost:3000/test"
SOCKET_URL="ws://localhost:8080"

# Check API health
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)
if [ "$API_STATUS" != "200" ]; then
    echo "API Health Check Failed: HTTP $API_STATUS"
    pm2 restart ridewave-server
fi

# Check Socket health (basic connection test)
timeout 5 bash -c "</dev/tcp/localhost/8080" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Socket Health Check Failed: Cannot connect to port 8080"
    pm2 restart ridewave-socket
fi

# Check MongoDB connection
mongosh --eval "db.adminCommand('ping')" --quiet
if [ $? -ne 0 ]; then
    echo "MongoDB Health Check Failed"
    systemctl restart mongod
fi
EOF

chmod +x /opt/ridewave/scripts/health-check.sh

# Setup health check cron job
echo "*/2 * * * * /opt/ridewave/scripts/health-check.sh" | crontab -u ridewave -
```

## 💾 Backup & Recovery

### Database Backup

```bash
# Create backup script
cat > /opt/ridewave/scripts/backup-db.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/ridewave/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ridewave_backup_$DATE"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create MongoDB backup
mongodump --db ridewave --out $BACKUP_FILE

# Compress backup
tar -czf "$BACKUP_FILE.tar.gz" -C $BACKUP_DIR "ridewave_backup_$DATE"
rm -rf "$BACKUP_FILE"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "ridewave_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.tar.gz"
EOF

chmod +x /opt/ridewave/scripts/backup-db.sh

# Setup daily backup
echo "0 2 * * * /opt/ridewave/scripts/backup-db.sh" | crontab -u ridewave -
```

### Application Backup

```bash
# Create application backup script
cat > /opt/ridewave/scripts/backup-app.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/ridewave/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ridewave_app_$DATE.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup application files (excluding node_modules and logs)
tar -czf $BACKUP_FILE \
    --exclude='node_modules' \
    --exclude='logs' \
    --exclude='*.log' \
    -C /opt/ridewave \
    server socket

# Keep only last 7 days of backups
find $BACKUP_DIR -name "ridewave_app_*.tar.gz" -mtime +7 -delete

echo "Application backup completed: $BACKUP_FILE"
EOF

chmod +x /opt/ridewave/scripts/backup-app.sh

# Setup weekly application backup
echo "0 3 * * 0 /opt/ridewave/scripts/backup-app.sh" | crontab -u ridewave -
```

## 🔐 Security Hardening

### System Security

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install fail2ban for intrusion prevention
sudo apt install -y fail2ban

# Configure fail2ban
sudo vim /etc/fail2ban/jail.local

# Add configuration
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

# Start fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Configure automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Application Security

```bash
# Create security configuration script
cat > /opt/ridewave/scripts/security-setup.sh << 'EOF'
#!/bin/bash

# Set proper file permissions
chmod 600 /opt/ridewave/server/.env
chmod 600 /opt/ridewave/socket/.env
chmod 755 /opt/ridewave/scripts/*.sh

# Create application firewall rules
sudo ufw allow from 127.0.0.1 to any port 3000
sudo ufw allow from 127.0.0.1 to any port 8080
sudo ufw deny 3000
sudo ufw deny 8080

# Setup log monitoring for security events
sudo vim /etc/logwatch/conf/services/ridewave.conf

# Add configuration
Title = "RideWave Application Logs"
LogFile = /opt/ridewave/logs/*.log
*OnlyService = ridewave

# Create security monitoring script
cat > /opt/ridewave/scripts/security-monitor.sh << 'SECURITY_EOF'
#!/bin/bash

# Monitor for suspicious activities
LOG_FILE="/opt/ridewave/logs/security-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check for failed login attempts
FAILED_LOGINS=$(grep "Failed password" /var/log/auth.log | wc -l)
if [ "$FAILED_LOGINS" -gt 10 ]; then
    echo "[$DATE] SECURITY ALERT: $FAILED_LOGINS failed login attempts" >> $LOG_FILE
fi

# Check for unusual network connections
NETSTAT_OUTPUT=$(netstat -an | grep ESTABLISHED | wc -l)
if [ "$NETSTAT_OUTPUT" -gt 100 ]; then
    echo "[$DATE] SECURITY ALERT: High number of network connections: $NETSTAT_OUTPUT" >> $LOG_FILE
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "[$DATE] SECURITY ALERT: Disk usage critical: ${DISK_USAGE}%" >> $LOG_FILE
fi
SECURITY_EOF

chmod +x /opt/ridewave/scripts/security-monitor.sh

# Setup security monitoring cron job
echo "*/10 * * * * /opt/ridewave/scripts/security-monitor.sh" | crontab -u ridewave -
EOF

chmod +x /opt/ridewave/scripts/security-setup.sh
sudo /opt/ridewave/scripts/security-setup.sh
```

## 🔄 Maintenance & Updates

### Update Script

```bash
# Create update script
cat > /opt/ridewave/scripts/update-app.sh << 'EOF'
#!/bin/bash

echo "Starting RideWave application update..."

# Backup current version
/opt/ridewave/scripts/backup-app.sh

# Update server API
cd /opt/ridewave/server
git pull origin main
npm install
npm run build
npx prisma generate
npx prisma db push

# Update socket server
cd /opt/ridewave/socket
git pull origin main
npm install

# Restart applications
pm2 restart ridewave-server
pm2 restart ridewave-socket

# Check status
pm2 status

echo "Update completed successfully!"
EOF

chmod +x /opt/ridewave/scripts/update-app.sh
```

### Maintenance Tasks

```bash
# Create maintenance script
cat > /opt/ridewave/scripts/maintenance.sh << 'EOF'
#!/bin/bash

echo "Starting maintenance tasks..."

# Clean old logs
find /opt/ridewave/logs -name "*.log" -mtime +30 -delete

# Clean old backups
find /opt/ridewave/backups -name "*.tar.gz" -mtime +30 -delete

# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart services if needed
pm2 restart ridewave-server
pm2 restart ridewave-socket

# Check disk space
df -h

echo "Maintenance completed!"
EOF

chmod +x /opt/ridewave/scripts/maintenance.sh

# Setup weekly maintenance
echo "0 4 * * 1 /opt/ridewave/scripts/maintenance.sh" | crontab -u ridewave -
```

## 🚨 Troubleshooting

### Common Issues & Solutions

#### Application Won't Start
```bash
# Check PM2 status
pm2 status
pm2 logs

# Check system resources
htop
df -h

# Check MongoDB status
sudo systemctl status mongod
mongosh --eval "db.adminCommand('ping')"

# Check Redis status (if using)
sudo systemctl status redis-server
redis-cli ping
```

#### Database Connection Issues
```bash
# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test database connection
mongosh "mongodb://ridewave_user:your_secure_password@localhost:27017/ridewave?authSource=ridewave"

# Check database permissions
mongosh --eval "db.runCommand({usersInfo: 'ridewave_user'})"
```

#### High Memory Usage
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Restart applications
pm2 restart all

# Check for memory leaks
pm2 monit
```

#### Network Issues
```bash
# Check port status
netstat -tulpn | grep :3000
netstat -tulpn | grep :8080

# Check firewall
sudo ufw status

# Test connectivity
curl http://localhost:3000/test
telnet localhost 8080
```

### Log Analysis

```bash
# View application logs
tail -f /opt/ridewave/logs/server-combined.log
tail -f /opt/ridewave/logs/socket-combined.log

# Search for errors
grep -i error /opt/ridewave/logs/*.log
grep -i "failed" /opt/ridewave/logs/*.log

# Monitor real-time logs
pm2 logs --lines 100
```

## 📞 Support & Maintenance

### Contact Information
- **System Administrator**: admin@your-domain.com
- **Development Team**: dev@your-domain.com
- **Emergency Contact**: +1-XXX-XXX-XXXX

### Regular Maintenance Schedule
- **Daily**: Health checks, log monitoring
- **Weekly**: Application backups, security scans
- **Monthly**: System updates, performance review
- **Quarterly**: Security audit, disaster recovery test

---

*This deployment guide provides comprehensive instructions for deploying and maintaining the RideWave application on a Linux VM. Follow these steps carefully and adapt them to your specific environment requirements.*
