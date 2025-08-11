# StorageMarket Admin Panel - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Features](#core-features)
6. [Database Schema](#database-schema)
7. [Authentication & Security](#authentication--security)
8. [API Integration](#api-integration)
9. [Deployment Guide](#deployment-guide)
10. [Development Guidelines](#development-guidelines)

## Project Overview

StorageMarket Admin Panel is a comprehensive web-based administrative dashboard for managing a storage marketplace platform. The system integrates with a Flutter mobile application and provides administrative capabilities for managing users, listings, bookings, payments, disputes, and more.

### Key Objectives
- Centralized management of marketplace operations
- Real-time monitoring and analytics
- Secure payment and payout processing
- User verification and moderation
- Support and dispute resolution

## Architecture

### System Architecture
```
┌─────────────────────┐     ┌─────────────────────┐
│   Flutter Mobile    │     │    Admin Panel      │
│      App (User)     │     │   (React + Vite)    │
└──────────┬──────────┘     └──────────┬──────────┘
           │                           │
           └───────────┬───────────────┘
                       │
                ┌──────▼──────┐
                │   Firebase   │
                │              │
                ├──────────────┤
                │ Firestore DB │
                │ Realtime DB  │
                │   Storage    │
                │     Auth     │
                └──────────────┘
```

### Component Architecture
- **Frontend**: React 18 with Vite build system
- **State Management**: React Context API for authentication
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom components
- **Backend**: Firebase services (Firestore, Realtime Database, Auth, Storage)

## Technology Stack

### Frontend Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.24.0",
  "firebase": "^10.14.1",
  "recharts": "^2.12.7",
  "lucide-react": "^0.396.0",
  "date-fns": "^3.6.0",
  "tailwindcss": "^3.4.4"
}
```

### Development Tools
- Vite (Build tool)
- ESLint (Code linting)
- PostCSS (CSS processing)
- Autoprefixer (CSS vendor prefixes)

## Project Structure

```
storagemarket-admin/
├── src/
│   ├── components/           # React components
│   │   ├── Analytics/       # Analytics dashboard components
│   │   ├── Audit/          # Audit logging components
│   │   ├── Auth/           # Authentication components
│   │   ├── Bookings/       # Booking management
│   │   ├── Chat/           # Chat support system
│   │   ├── Dashboard/      # Main dashboard
│   │   ├── Disputes/       # Dispute resolution
│   │   ├── Landing/        # Landing page
│   │   ├── Layout/         # Layout components
│   │   ├── Listings/       # Listing management
│   │   ├── Logo/           # Logo components
│   │   ├── Notifications/  # Notification system
│   │   ├── Payments/       # Payment processing
│   │   ├── Reviews/        # Review moderation
│   │   ├── Settings/       # System settings
│   │   ├── Users/          # User management
│   │   └── Verification/   # User verification
│   ├── context/            # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Firebase service layer
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── firebaseConfig.js   # Firebase configuration
├── public/                 # Static assets
├── dist/                   # Build output
└── package.json           # Project dependencies
```

## Core Features

### 1. Dashboard
- Real-time metrics display
- Revenue tracking
- User activity monitoring
- System health indicators

### 2. User Management
- User listing with search and filters
- Role-based access control (Admin, Moderator, Support)
- User verification status tracking
- Account actions (suspend, delete, verify)

### 3. Listing Management
- Storage listing moderation
- Approval/rejection workflow
- Content moderation
- Pricing management

### 4. Booking Management
- Real-time booking status
- Payment tracking
- Cancellation handling
- Refund processing

### 5. Payment System
- Payment verification
- Transaction history
- Platform fee calculation (9%)
- Host payout management

### 6. Analytics Dashboard
- Revenue analytics
- User growth metrics
- Geographic distribution
- Predictive analytics
- Export capabilities (PDF, CSV)

### 7. Chat Support
- Real-time messaging
- User-to-support chat
- Chat history
- Multiple conversation handling

### 8. Dispute Resolution
- Dispute tracking
- Timeline visualization
- Resolution workflow
- Evidence management

### 9. Verification Center
- Document verification
- Identity verification
- Listing verification
- Automated verification queue

### 10. Review Management
- Review moderation
- Sentiment analysis
- Inappropriate content detection
- Response management

### 11. Notification System
- Real-time notifications
- Email notifications
- In-app notifications
- Notification preferences

### 12. Audit Logging
- Action tracking
- User activity logs
- System event logs
- Compliance reporting

## Database Schema

### Firestore Collections

#### users
```javascript
{
  id: string,
  email: string,
  name: string,
  type: 'host' | 'client' | 'admin',
  role: 'admin' | 'moderator' | 'support',
  verified: boolean,
  createdAt: timestamp,
  phoneNumber: string,
  location: string,
  status: 'active' | 'suspended' | 'deleted'
}
```

#### listings
```javascript
{
  id: string,
  hostId: string,
  title: string,
  description: string,
  location: geopoint,
  price: number,
  capacity: string,
  status: 'pending' | 'approved' | 'rejected',
  images: array,
  createdAt: timestamp
}
```

#### bookings
```javascript
{
  id: string,
  listingId: string,
  clientId: string,
  hostId: string,
  startDate: timestamp,
  endDate: timestamp,
  amount: number,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  paymentStatus: 'pending' | 'paid' | 'refunded',
  createdAt: timestamp
}
```

#### payments
```javascript
{
  id: string,
  bookingId: string,
  amount: number,
  method: string,
  status: 'pending' | 'completed' | 'failed',
  transactionId: string,
  createdAt: timestamp
}
```

#### payouts
```javascript
{
  id: string,
  hostId: string,
  period: { start: timestamp, end: timestamp },
  totalAmount: number,
  platformFees: number,
  netAmount: number,
  status: 'pending' | 'processing' | 'completed',
  bookingIds: array,
  createdAt: timestamp
}
```

#### disputes
```javascript
{
  id: string,
  bookingId: string,
  raisedBy: string,
  type: string,
  description: string,
  status: 'open' | 'investigating' | 'resolved',
  resolution: string,
  createdAt: timestamp
}
```

#### reviews
```javascript
{
  id: string,
  bookingId: string,
  reviewerId: string,
  rating: number,
  comment: string,
  status: 'pending' | 'approved' | 'rejected',
  createdAt: timestamp
}
```

### Realtime Database Structure

#### chats
```javascript
{
  conversationId: {
    participants: array,
    lastMessage: string,
    lastMessageTime: timestamp,
    messages: {
      messageId: {
        senderId: string,
        text: string,
        timestamp: timestamp,
        read: boolean
      }
    }
  }
}
```

## Authentication & Security

### Authentication Flow
1. Admin users authenticate via email/password
2. Firebase Auth manages sessions
3. Custom claims for role-based access
4. Protected routes require authentication

### Security Measures
- Environment variables for sensitive data
- Firebase Security Rules
- Role-based access control (RBAC)
- Input validation and sanitization
- HTTPS enforcement
- Regular security audits

### User Roles
- **Admin**: Full system access
- **Moderator**: Content moderation, user management
- **Support**: Chat support, basic user assistance

## API Integration

### Firebase Services

#### Authentication
```javascript
// Sign in
signInWithEmailAndPassword(auth, email, password)

// Sign out
signOut(auth)

// Current user
auth.currentUser
```

#### Firestore Operations
```javascript
// Read
collection(db, 'collectionName')
query(collection, where('field', '==', value))

// Write
addDoc(collection, data)
updateDoc(doc, data)
deleteDoc(doc)

// Real-time updates
onSnapshot(query, callback)
```

#### Storage
```javascript
// Upload
uploadBytes(storageRef, file)
getDownloadURL(storageRef)

// Delete
deleteObject(storageRef)
```

## Deployment Guide

### Prerequisites
- Node.js 18+ installed
- Firebase project created
- Environment variables configured

### Development Setup
```bash
# Clone repository
git clone [repository-url]
cd storagemarket-admin

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Firebase credentials

# Start development server
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Firebase Deployment
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Deploy
firebase deploy
```

## Development Guidelines

### Code Style
- Use functional components with hooks
- Follow ESLint configuration
- Use semantic HTML
- Implement proper error handling

### Component Guidelines
- Create reusable components
- Use PropTypes or TypeScript for type safety
- Implement loading and error states
- Follow accessibility best practices

### State Management
- Use Context API for global state
- Local state for component-specific data
- Custom hooks for reusable logic

### Performance Optimization
- Lazy load components
- Implement pagination for large lists
- Use React.memo for expensive components
- Optimize images and assets

### Testing
- Unit tests for utilities
- Component testing with React Testing Library
- Integration tests for critical flows
- End-to-end testing with Cypress

### Version Control
- Use feature branches
- Write descriptive commit messages
- Regular code reviews
- Maintain changelog

## Troubleshooting

### Common Issues

1. **Blank Analytics/Payouts Pages**
   - Ensure recharts is properly imported
   - Check Firebase data structure
   - Verify user permissions

2. **Authentication Issues**
   - Check Firebase Auth configuration
   - Verify environment variables
   - Clear browser cache

3. **Real-time Updates Not Working**
   - Check Firestore rules
   - Verify network connectivity
   - Check console for errors

4. **Build Failures**
   - Clear node_modules and reinstall
   - Check for TypeScript errors
   - Verify all imports

## Support

For issues and feature requests, please contact the development team or create an issue in the project repository.

---

Last Updated: January 2025
Version: 1.0.0