
# RiderIN - Complete Ride-Sharing Application

A comprehensive ride-sharing platform similar to Uber/Lyft, built with React Native, Node.js, and real-time WebSocket communication.

## 🏗️ Architecture Overview

The application consists of **4 main components**:

1. **Driver App** (`driver/`) - React Native/Expo app for drivers
2. **User App** (`user/`) - React Native/Expo app for passengers  
3. **Backend Server** (`server/`) - Node.js/Express API server
4. **WebSocket Server** (`socket/`) - Real-time location and ride matching

## 📱 Mobile Applications

### Driver App Features:
- **Authentication**: Phone number + OTP verification via Twilio
- **Registration**: Multi-step process with email verification via Nylas
- **Home Dashboard**: 
  - Toggle online/offline status
  - View recent rides
  - Real-time location tracking
- **Ride Management**: 
  - Receive ride requests via push notifications
  - Accept/decline rides
  - Track ride progress
  - Update ride status (Processing → Completed)
- **Real-time Features**: WebSocket connection for location updates

### User App Features:
- **Onboarding**: Welcome screens for new users
- **Authentication**: Phone number + OTP verification
- **Ride Booking**:
  - Google Places autocomplete for destination
  - Real-time map with current location
  - Driver selection based on vehicle type
  - Price calculation based on distance
- **Ride Tracking**: Real-time updates via push notifications
- **Ride History**: View past rides

## 🖥️ Backend Server

### Technology Stack:
- **Node.js + Express** - REST API server
- **Prisma + MongoDB** - Database ORM and storage
- **JWT** - Authentication tokens
- **Twilio** - SMS OTP verification
- **Nylas** - Email services

### API Endpoints:

#### User Routes (`/api/v1/`):
- `POST /registration` - Send OTP to phone
- `POST /verify-otp` - Verify phone OTP
- `POST /email-otp-request` - Send email verification
- `PUT /email-otp-verify` - Verify email OTP
- `GET /me` - Get user profile
- `GET /get-rides` - Get user's ride history

#### Driver Routes (`/api/v1/driver/`):
- `POST /send-otp` - Send OTP to driver phone
- `POST /login` - Driver login
- `POST /verify-otp` - Verify driver OTP
- `POST /registration-driver` - Complete driver registration
- `GET /me` - Get driver profile
- `PUT /update-status` - Update online/offline status
- `POST /new-ride` - Create new ride
- `PUT /update-ride-status` - Update ride status
- `GET /get-drivers-data` - Get driver details by IDs
- `GET /get-rides` - Get driver's ride history

## 🔌 WebSocket Server

### Real-time Features:
- **Location Tracking**: Drivers continuously send location updates
- **Ride Matching**: Find nearby drivers within 5km radius
- **Real-time Communication**: Instant ride requests and responses

### WebSocket Events:
- `locationUpdate` - Driver location updates
- `requestRide` - User requests nearby drivers
- `nearbyDrivers` - Server responds with available drivers

## 🗄️ Database Schema

### Models:
1. **User**: Basic user information, ratings, ride count
2. **Driver**: Detailed driver info, vehicle details, earnings, status
3. **Rides**: Ride records linking users and drivers with trip details

### Key Features:
- **Vehicle Types**: Car, Motorcycle, CNG
- **Ride Status**: Processing, Completed, etc.
- **Ratings System**: For both users and drivers
- **Earnings Tracking**: Driver total earnings and ride counts

## 🚀 How to Use the Application

### For Users:
1. **Download** the user app
2. **Register** with phone number (OTP verification)
3. **Complete profile** with email verification
4. **Book rides**:
   - Enter destination using Google Places
   - Select vehicle type
   - Confirm booking
5. **Track ride** in real-time
6. **Rate driver** after completion

### For Drivers:
1. **Download** the driver app
2. **Register** with detailed vehicle information
3. **Verify** phone and email
4. **Go online** to receive ride requests
5. **Accept rides** and navigate to passengers
6. **Update ride status** as trip progresses
7. **Complete rides** and earn money

## 🔧 Technical Features

### Real-time Capabilities:
- **WebSocket connections** for instant communication
- **Push notifications** via Expo for ride updates
- **GPS tracking** with high accuracy
- **Live location sharing** between users and drivers

### Third-party Integrations:
- **Google Maps API** - Maps, directions, places
- **Twilio** - SMS verification
- **Nylas** - Email services
- **Expo Push Notifications** - Mobile notifications

### Security:
- **JWT authentication** for API access
- **OTP verification** for phone numbers
- **Email verification** for account security
- **Protected routes** with middleware

## 💡 Key Usage Scenarios

1. **User wants a ride**: Opens app → Selects destination → Chooses driver → Confirms booking
2. **Driver receives request**: Gets push notification → Views trip details → Accepts/declines
3. **Real-time tracking**: Both parties see live location updates during the ride
4. **Ride completion**: Driver marks ride complete → Payment processed → Rating system

## 🛠️ Installation & Setup

### Prerequisites:
- Node.js (v14 or higher)
- MongoDB
- Expo CLI
- React Native development environment

### Environment Variables:
Create `.env` files in each project directory with the following variables:

#### Server (.env):
```
DATABASE_URL=mongodb://localhost:27017/riderin
PORT=5000
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_SERVICE_SID=your_twilio_service_sid
NYLAS_API_KEY=your_nylas_api_key
USER_GRANT_ID=your_nylas_grant_id
EMAIL_ACTIVATION_SECRET=your_jwt_secret
```

#### Mobile Apps (.env):
```
EXPO_PUBLIC_SERVER_URI=http://localhost:5000
EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=your_google_maps_api_key
```

### Installation Steps:

1. **Clone the repository**
```bash
git clone <repository-url>
cd riderin
```

2. **Install server dependencies**
```bash
cd server
npm install
npm run dev
```

3. **Install WebSocket server dependencies**
```bash
cd socket
npm install
npm start
```

4. **Install driver app dependencies**
```bash
cd driver
npm install
expo start
```

5. **Install user app dependencies**
```bash
cd user
npm install
expo start
```

## 📱 Mobile App Development

### Driver App:
- Built with Expo SDK 51
- Uses React Native Maps for location services
- Implements real-time WebSocket communication
- Push notifications for ride requests

### User App:
- Built with Expo SDK 51
- Google Places integration for destination search
- Real-time ride tracking
- Push notifications for ride updates

## 🔒 Security Features

- **Phone Number Verification**: SMS OTP via Twilio
- **Email Verification**: Secure email verification via Nylas
- **JWT Authentication**: Secure API access tokens
- **Protected Routes**: Middleware-based route protection
- **Input Validation**: Server-side validation for all inputs

## 🌐 API Documentation

### Authentication Flow:
1. User/Driver enters phone number
2. Server sends OTP via Twilio
3. User/Driver verifies OTP
4. Server returns JWT token for authenticated requests

### Ride Flow:
1. User requests ride with destination
2. WebSocket finds nearby drivers
3. Driver receives push notification
4. Driver accepts/declines ride
5. Real-time tracking during ride
6. Ride completion and payment processing

## 🚀 Deployment

### Server Deployment:
- Deploy Node.js server to cloud platform (AWS, Heroku, etc.)
- Set up MongoDB Atlas for database
- Configure environment variables
- Set up WebSocket server

### Mobile App Deployment:
- Build production apps using Expo EAS Build
- Deploy to App Store and Google Play Store
- Configure push notification certificates

## 📊 Monitoring & Analytics

- **Driver Performance**: Track earnings, ride count, ratings
- **User Activity**: Monitor ride history and preferences
- **System Health**: Monitor WebSocket connections and API performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Author**: Mahesh Kumar Sugumaran
- **Project**: RiderIN - Complete Ride-Sharing Platform

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**RiderIN** - Connecting passengers with drivers in real-time, making transportation accessible and efficient.
