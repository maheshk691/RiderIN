# 🚀 RiderIN Server API

## Overview

The RiderIN Server is a Node.js backend API built with Express.js and TypeScript that powers the RiderIN ride-sharing platform. It handles user authentication, driver management, ride operations, and real-time communication between users and drivers.

## 🏗️ Architecture Overview

### Core Technologies
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **SMS Service**: Twilio
- **Email Service**: Nylas
- **Validation**: Built-in validation
- **Development**: ts-node-dev for hot reloading

### Project Structure
```
server/
├── app.ts                    # Express app configuration
├── server.ts                 # Server startup file
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── prisma/
│   └── schema.prisma         # Database schema definition
├── controllers/              # Business logic handlers
│   ├── user.controller.ts    # User operations
│   └── driver.controller.ts  # Driver operations
├── routes/                   # API route definitions
│   ├── user.route.ts         # User endpoints
│   └── driver.route.ts       # Driver endpoints
├── middleware/                # Custom middleware
│   └── isAuthenticated.ts    # Authentication middleware
├── utils/                    # Utility functions
│   ├── prisma.ts            # Database connection
│   └── send-token.ts        # JWT token generation
└── @types/                   # TypeScript type definitions
    ├── global.d.ts          # Global types
    └── prisma.d.ts          # Prisma types
```

## 🗄️ Database Schema

### Models Overview

#### User Model
```prisma
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

#### Driver Model
```prisma
model driver {
  id                  String      @id @default(auto()) @map("_id") @db.ObjectId
  name                String
  country             String
  phone_number        String      @unique
  email               String      @unique
  vehicle_type        VehicleType
  registration_number String      @unique
  registration_date   String
  driving_license     String
  vehicle_color       String?
  rate                String
  notificationToken   String?
  ratings             Float       @default(0)
  totalEarning        Float       @default(0)
  totalRides          Float       @default(0)
  pendingRides        Float       @default(0)
  cancelRides         Float       @default(0)
  status              String      @default("inactive")
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
  rides               rides[]     @relation("DriverRides")
}
```

#### Rides Model
```prisma
model rides {
  id                      String   @id @default(auto()) @map("_id") @db.ObjectId
  userId                  String   @db.ObjectId
  driverId                String   @db.ObjectId
  charge                  Float
  currentLocationName     String
  destinationLocationName String
  distance                String
  status                  String
  rating                  Float?
  user                    user     @relation("UserRides", fields: [userId], references: [id])
  driver                  driver   @relation("DriverRides", fields: [driverId], references: [id])
  cratedAt                DateTime @default(now())
  updatedAt               DateTime @updatedAt
}
```

#### Vehicle Types Enum
```prisma
enum VehicleType {
  Car
  Motorcycle
  CNG
}
```

## 🔌 API Endpoints

### User Routes (`/api/v1`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/registration` | Send OTP to user phone | ❌ |
| POST | `/verify-otp` | Verify phone OTP | ❌ |
| POST | `/email-otp-request` | Send OTP to email | ❌ |
| PUT | `/email-otp-verify` | Verify email OTP | ❌ |
| GET | `/me` | Get logged-in user data | ✅ |
| GET | `/get-rides` | Get user's ride history | ✅ |

### Driver Routes (`/api/v1/driver`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/send-otp` | Send OTP to driver phone | ❌ |
| POST | `/login` | Driver login with OTP | ❌ |
| POST | `/verify-otp` | Verify phone OTP for registration | ❌ |
| POST | `/registration-driver` | Complete driver registration | ❌ |
| GET | `/me` | Get logged-in driver data | ✅ |
| GET | `/get-drivers-data` | Get drivers by IDs | ❌ |
| PUT | `/update-status` | Update driver online/offline status | ✅ |
| POST | `/new-ride` | Create new ride | ✅ |
| PUT | `/update-ride-status` | Update ride status | ✅ |
| GET | `/get-rides` | Get driver's ride history | ✅ |

## 🔐 Authentication & Security

### JWT Token Implementation
```typescript
// Token generation
export const sendToken = async (user: any, res: any) => {
  const accessToken = jwt.sign(
    { id: user.id },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "30d" }
  );
  res.status(201).json({
    success: true,
    accessToken,
    user,
  });
};
```

### Authentication Middleware
- **User Authentication**: `isAuthenticated` middleware
- **Driver Authentication**: `isAuthenticatedDriver` middleware
- **Token Validation**: JWT verification with database lookup
- **Authorization**: Bearer token in Authorization header

### Security Features
- ✅ JWT-based authentication
- ✅ Phone number verification via Twilio
- ✅ Email verification via Nylas
- ✅ Protected routes with middleware
- ✅ Input validation
- ✅ Error handling

## 📱 External Services Integration

### Twilio SMS Service
```typescript
// OTP sending
await client.verify.v2
  .services(process.env.TWILIO_SERVICE_SID!)
  .verifications.create({
    channel: "sms",
    to: phone_number,
  });

// OTP verification
await client.verify.v2
  .services(process.env.TWILIO_SERVICE_SID!)
  .verificationChecks.create({
    to: phone_number,
    code: otp,
  });
```

### Nylas Email Service
```typescript
// Email sending
await nylas.messages.send({
  identifier: process.env.USER_GRANT_ID!,
  requestBody: {
    to: [{ name: name, email: email }],
    subject: "Verify your email address!",
    body: `Your verification code is ${otp}`,
  },
});
```

## 🚀 Enhancement Recommendations

### 1. Code Quality & Architecture

#### Error Handling Enhancement
```typescript
// Global error handler
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: err.details
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};
```

#### Input Validation
```typescript
// Using Joi for validation
import Joi from 'joi';

const userRegistrationSchema = Joi.object({
  phone_number: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required(),
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional()
});

export const validateUserRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { error } = userRegistrationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};
```

### 2. Performance Optimizations

#### Database Query Optimization
```typescript
// Add database indexes
model user {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  phone_number      String   @unique
  email             String?  @unique
  // Add indexes for frequently queried fields
  @@index([phone_number])
  @@index([email])
  @@index([createdAt])
}

// Optimize queries with proper includes
export const getRidesWithDetails = async (req: any, res: Response) => {
  const rides = await prisma.rides.findMany({
    where: { userId: req.user?.id },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          phone_number: true,
          vehicle_type: true,
          ratings: true
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          phone_number: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 20 // Limit results
  });
  
  res.status(200).json({ success: true, rides });
};
```

#### Caching Implementation
```typescript
// Redis caching for frequently accessed data
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export const getCachedDriverData = async (driverId: string) => {
  const cacheKey = `driver:${driverId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const driver = await prisma.driver.findUnique({
    where: { id: driverId }
  });
  
  if (driver) {
    await redis.setex(cacheKey, 300, JSON.stringify(driver)); // 5 min cache
  }
  
  return driver;
};
```

### 3. Enhanced Features

#### Real-time Communication
```typescript
// Socket.IO integration
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

const httpServer = new HTTPServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_driver_room', (driverId) => {
    socket.join(`driver_${driverId}`);
  });
  
  socket.on('ride_request', (data) => {
    // Broadcast ride request to nearby drivers
    io.to(`driver_${data.driverId}`).emit('new_ride_request', data);
  });
  
  socket.on('location_update', (data) => {
    // Broadcast location updates
    socket.broadcast.emit('driver_location_update', data);
  });
});
```

#### Rate Limiting
```typescript
// Express rate limiting
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/v1/registration', authLimiter);
app.use('/api/v1/driver/send-otp', authLimiter);
```

### 4. Security Enhancements

#### Enhanced Authentication
```typescript
// Refresh token implementation
export const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    { id: user.id, type: 'access' },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Token refresh endpoint
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    const { accessToken } = generateTokens(user);
    res.json({ success: true, accessToken });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};
```

#### Input Sanitization
```typescript
// Helmet for security headers
import helmet from 'helmet';

app.use(helmet());

// Input sanitization
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = DOMPurify.sanitize(req.body[key]);
      }
    });
  }
  next();
};
```

### 5. Monitoring & Logging

#### Structured Logging
```typescript
// Winston logger
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
};
```

#### Health Check Endpoint
```typescript
// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'connected',
        redis: 'connected'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});
```

### 6. Testing Implementation

#### Unit Tests
```typescript
// Jest test example
import request from 'supertest';
import { app } from '../app';

describe('User Registration', () => {
  it('should send OTP to valid phone number', async () => {
    const response = await request(app)
      .post('/api/v1/registration')
      .send({ phone_number: '+1234567890' });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
  
  it('should reject invalid phone number', async () => {
    const response = await request(app)
      .post('/api/v1/registration')
      .send({ phone_number: 'invalid' });
    
    expect(response.status).toBe(400);
  });
});
```

#### Integration Tests
```typescript
// Database integration tests
describe('Ride Management', () => {
  beforeEach(async () => {
    await prisma.rides.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.user.deleteMany();
  });
  
  it('should create a new ride', async () => {
    const user = await prisma.user.create({
      data: { phone_number: '+1234567890' }
    });
    
    const driver = await prisma.driver.create({
      data: {
        name: 'Test Driver',
        phone_number: '+0987654321',
        email: 'driver@test.com',
        vehicle_type: 'Car',
        registration_number: 'ABC123',
        registration_date: '2023-01-01',
        driving_license: 'DL123',
        rate: '10'
      }
    });
    
    const response = await request(app)
      .post('/api/v1/driver/new-ride')
      .set('Authorization', `Bearer ${generateToken(driver)}`)
      .send({
        userId: user.id,
        charge: 50,
        status: 'Processing',
        currentLocationName: 'Location A',
        destinationLocationName: 'Location B',
        distance: '5km'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## 📋 Implementation Priority

### High Priority
- ✅ Implement comprehensive error handling
- ✅ Add input validation with Joi
- ✅ Implement rate limiting
- ✅ Add request logging
- ✅ Database query optimization

### Medium Priority
- ⚡ Redis caching implementation
- ⚡ Socket.IO for real-time features
- ⚡ Refresh token mechanism
- ⚡ Health check endpoints
- ⚡ Unit and integration tests

### Low Priority
- 📊 Advanced monitoring (Prometheus/Grafana)
- 🔒 Advanced security features
- 📈 Performance metrics
- 🧪 End-to-end testing
- 📚 API documentation (Swagger)

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Twilio account (for SMS)
- Nylas account (for email)

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables
Create a `.env` file in the server directory:
```env
# Database
DATABASE_URL="mongodb://localhost:27017/riderin"

# JWT Secrets
ACCESS_TOKEN_SECRET="your-access-token-secret"
EMAIL_ACTIVATION_SECRET="your-email-activation-secret"

# Twilio Configuration
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_SERVICE_SID="your-twilio-service-sid"

# Nylas Configuration
NYLAS_API_KEY="your-nylas-api-key"
USER_GRANT_ID="your-nylas-grant-id"

# Server Configuration
PORT=5000
NODE_ENV=development
```

## 📊 Current Features Status

- ✅ User registration and authentication
- ✅ Driver registration and authentication
- ✅ Phone number verification (Twilio)
- ✅ Email verification (Nylas)
- ✅ JWT-based authentication
- ✅ Ride creation and management
- ✅ Driver status management
- ✅ Ride history tracking
- ✅ Earnings calculation
- ✅ Protected API routes

## 🔧 Development Notes

- The server uses Prisma as the ORM for MongoDB
- JWT tokens expire after 30 days
- All sensitive operations require authentication
- Phone numbers must be in international format
- Email verification is optional for users but required for drivers
- Ride statuses: Processing → Ongoing → Completed

## 📞 Support

For development questions or issues, refer to the main project documentation or contact the development team.

---

*This documentation provides a comprehensive overview of the RiderIN Server API architecture, features, and enhancement recommendations for future development.*
