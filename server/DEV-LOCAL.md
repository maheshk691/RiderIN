# 🖥️ RiderIN Server - Local Development & Testing Guide

## Overview

This guide provides comprehensive instructions for setting up and testing the RiderIN Server API locally on your system. The server is built with Node.js, Express.js, TypeScript, and uses MongoDB with Prisma ORM for data management.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Development Environment Setup](#development-environment-setup)
3. [Database Setup](#database-setup)
4. [Project Setup](#project-setup)
5. [Environment Configuration](#environment-configuration)
6. [API Development Server](#api-development-server)
7. [Database Management](#database-management)
8. [API Testing](#api-testing)
9. [External Services Setup](#external-services-setup)
10. [Debugging & Development Tools](#debugging--development-tools)
11. [Common Issues & Solutions](#common-issues--solutions)
12. [Development Workflow](#development-workflow)

## 🖥️ System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 5GB free space
- **Node.js**: v16.0.0 or higher
- **MongoDB**: v4.4 or higher
- **Git**: Latest version

### Recommended Development Setup
- **IDE**: Visual Studio Code with TypeScript extensions
- **Terminal**: PowerShell (Windows), Terminal (macOS), or Bash (Linux)
- **Database GUI**: MongoDB Compass or Studio 3T
- **API Testing**: Postman or Insomnia

## 🛠️ Development Environment Setup

### 1. Install Node.js

#### Windows
```powershell
# Download and install Node.js from https://nodejs.org/
# Or use Chocolatey
choco install nodejs

# Verify installation
node --version
npm --version
```

#### macOS
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
# Verify installation
node --version
npm --version
```

#### Linux (Ubuntu/Debian)
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install MongoDB

#### Windows
```powershell
# Download MongoDB Community Server from https://www.mongodb.com/try/download/community
# Or use Chocolatey
choco install mongodb

# Start MongoDB service
net start MongoDB
```

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. Install Additional Tools

```bash
# Install TypeScript globally
npm install -g typescript

# Install ts-node globally
npm install -g ts-node

# Install nodemon globally (optional)
npm install -g nodemon

# Verify installations
tsc --version
ts-node --version
```

## 🗄️ Database Setup

### 1. MongoDB Configuration

#### Create Database
```bash
# Connect to MongoDB shell
mongosh

# Create database
use ridewave

# Create collections (optional, Prisma will create them)
db.createCollection("users")
db.createCollection("drivers")
db.createCollection("rides")

# Exit MongoDB shell
exit
```

#### MongoDB Compass Setup
```bash
# Download MongoDB Compass from https://www.mongodb.com/products/compass
# Connect to: mongodb://localhost:27017
# Database: ridewave
```

### 2. Prisma Setup

#### Initialize Prisma Client
```bash
# Navigate to server directory
cd server

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# View database in Prisma Studio
npx prisma studio
```

## 📁 Project Setup

### 1. Clone and Navigate to Server

```bash
# Navigate to your project directory
cd /path/to/ridewave/server

# Install dependencies
npm install

# Verify project structure
ls -la
```

### 2. Project Structure Overview

```
server/
├── controllers/            # API controllers
│   ├── driver.controller.ts
│   └── user.controller.ts
├── middleware/             # Custom middleware
│   └── isAuthenticated.ts
├── prisma/                # Database schema
│   └── schema.prisma
├── routes/                 # API routes
│   ├── driver.route.ts
│   └── user.route.ts
├── utils/                  # Utility functions
│   ├── prisma.ts
│   └── send-token.ts
├── app.ts                  # Express app configuration
├── server.ts               # Server entry point
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript config
```

### 3. Environment Configuration

#### Create Environment File
```bash
# Create .env file in server directory
touch .env
```

#### Add Environment Variables (.env)
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="mongodb://localhost:27017/ridewave"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Twilio Configuration (SMS)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Nylas Configuration (Email)
NYLAS_API_KEY="your-nylas-api-key"
NYLAS_CLIENT_ID="your-nylas-client-id"
NYLAS_CLIENT_SECRET="your-nylas-client-secret"

# External Services
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Development Settings
DEBUG=true
LOG_LEVEL=debug
```

### 4. Update package.json Scripts

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only server.ts",
    "start": "node build/server.js",
    "build": "tsc",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:seed": "ts-node prisma/seed.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix"
  }
}
```

## 🚀 API Development Server

### 1. Start Development Server

```bash
# Navigate to server directory
cd server

# Start development server with hot reload
npm run dev

# Alternative commands
npm start          # Production build
ts-node server.ts  # Direct TypeScript execution
```

### 2. Development Server Options

```bash
# Start with specific options
npm run dev -- --inspect    # Enable debugging
npm run dev -- --watch      # Watch mode
npm run dev -- --clear      # Clear cache
```

### 3. Server Endpoints

#### Test Endpoint
```bash
# Test server is running
curl http://localhost:3000/test

# Expected response
{
  "succcess": true,
  "message": "API is working"
}
```

#### API Base URLs
```bash
# User API endpoints
http://localhost:3000/api/v1/

# Driver API endpoints  
http://localhost:3000/api/v1/driver/
```

## 🗄️ Database Management

### 1. Prisma Commands

#### Generate Client
```bash
# Generate Prisma client after schema changes
npx prisma generate
```

#### Database Operations
```bash
# Push schema changes to database
npx prisma db push

# Reset database (WARNING: Deletes all data)
npx prisma db push --force-reset

# View database in Prisma Studio
npx prisma studio
```

#### Database Seeding
```bash
# Create seed file
touch prisma/seed.ts

# Add seed data
# Run seed
npm run db:seed
```

### 2. Database Schema Management

#### Update Schema
```prisma
// prisma/schema.prisma
model user {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  name              String?
  phone_number      String   @unique
  email             String?  @unique
  notificationToken String?
  ratings           Float    @default(0)
  totalRides        Float    @default(0)
  cratedAt          DateTime @default(now())
  updatedAt         DateTime @updatedAt
  rides             rides[]  @relation("UserRides")
}
```

#### Apply Changes
```bash
# After modifying schema
npx prisma generate
npx prisma db push
```

## 🧪 API Testing

### 1. Postman Collection Setup

#### Create Postman Collection
```json
{
  "info": {
    "name": "RideWave API",
    "description": "RideWave Server API Collection"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api/v1"
    }
  ]
}
```

#### Test User Registration
```bash
# POST /api/v1/registration
curl -X POST http://localhost:3000/api/v1/registration \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+1234567890",
    "country_code": "+1"
  }'
```

#### Test Driver Login
```bash
# POST /api/v1/driver/send-otp
curl -X POST http://localhost:3000/api/v1/driver/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+1234567890",
    "country_code": "+1"
  }'
```

### 2. Automated Testing

#### Install Testing Dependencies
```bash
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

#### Create Test Files
```typescript
// tests/user.test.ts
import request from 'supertest';
import { app } from '../app';

describe('User API', () => {
  test('POST /registration should send OTP', async () => {
    const response = await request(app)
      .post('/api/v1/registration')
      .send({
        phone_number: '+1234567890',
        country_code: '+1'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

#### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test tests/user.test.ts
```

## 🔌 External Services Setup

### 1. Twilio Setup (SMS)

#### Create Twilio Account
```bash
# 1. Go to https://www.twilio.com/
# 2. Create account
# 3. Get Account SID and Auth Token
# 4. Purchase phone number
# 5. Add credentials to .env file
```

#### Test SMS Functionality
```typescript
// Test SMS sending
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (phoneNumber: string, message: string) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    console.log('SMS sent:', result.sid);
  } catch (error) {
    console.error('SMS error:', error);
  }
};
```

### 2. Nylas Setup (Email)

#### Create Nylas Account
```bash
# 1. Go to https://www.nylas.com/
# 2. Create account
# 3. Get API Key
# 4. Add credentials to .env file
```

#### Test Email Functionality
```typescript
// Test email sending
import Nylas from 'nylas';

const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY!,
  apiUri: "https://api.eu.nylas.com",
});

const sendEmail = async (to: string, subject: string, body: string) => {
  try {
    const result = await nylas.send({
      to: [{ email: to }],
      subject: subject,
      body: body
    });
    console.log('Email sent:', result.id);
  } catch (error) {
    console.error('Email error:', error);
  }
};
```

### 3. Google Maps Setup

#### Create Google Cloud Project
```bash
# 1. Go to https://console.cloud.google.com/
# 2. Create project
# 3. Enable Maps API
# 4. Create API key
# 5. Add to .env file
```

## 🔧 Debugging & Development Tools

### 1. VS Code Configuration

#### Install Extensions
```bash
# Recommended VS Code extensions:
# - TypeScript Importer
# - Prisma
# - REST Client
# - Thunder Client
# - MongoDB for VS Code
```

#### VS Code Settings
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "prisma.showPrismaDataPlatformNotification": false,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 2. Debugging Configuration

#### VS Code Launch Configuration
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server.ts",
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

### 3. Logging Setup

#### Winston Logger Setup
```bash
# Install Winston
npm install winston
npm install --save-dev @types/winston
```

#### Logger Configuration
```typescript
// utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

## 🚨 Common Issues & Solutions

### 1. Database Issues

#### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

#### Prisma Issues
```bash
# Clear Prisma cache
rm -rf node_modules/.prisma

# Regenerate client
npx prisma generate

# Reset database
npx prisma db push --force-reset
```

### 2. Port Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### 3. Environment Issues

#### Missing Environment Variables
```bash
# Check .env file exists
ls -la .env

# Verify environment variables
node -e "console.log(process.env.DATABASE_URL)"
```

### 4. TypeScript Issues

#### Type Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Clear TypeScript cache
rm -rf node_modules/.cache
```

## 🔄 Development Workflow

### 1. Daily Development Routine

```bash
# Morning setup
cd server
npm run dev

# Make changes to code
# Test API endpoints
# Check database changes
# Commit changes

# Evening cleanup
# Stop development server
# Commit final changes
```

### 2. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-api-endpoint

# Develop feature
# Write tests
# Test thoroughly
# Create pull request
# Merge to main
```

### 3. API Development Checklist

- [ ] Server starts successfully
- [ ] Database connection works
- [ ] API endpoints respond correctly
- [ ] Authentication works
- [ ] External services (Twilio, Nylas) work
- [ ] Error handling is proper
- [ ] Logging is configured
- [ ] Tests pass
- [ ] Documentation is updated

### 4. Database Development Checklist

- [ ] Schema is properly defined
- [ ] Prisma client is generated
- [ ] Database is seeded with test data
- [ ] Migrations are applied
- [ ] Data validation works
- [ ] Relationships are correct

## 📞 Support & Resources

### Documentation Links
- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Community Support
- [Node.js Community](https://github.com/nodejs)
- [Prisma Community](https://www.prisma.io/community)
- [MongoDB Community](https://community.mongodb.com/)

### Development Tools
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [Postman](https://www.postman.com/)
- [Prisma Studio](https://www.prisma.io/studio)

---

*This server development guide provides comprehensive instructions for setting up and testing the RideWave Server API locally. Follow these steps carefully and adapt them to your specific development environment.*
