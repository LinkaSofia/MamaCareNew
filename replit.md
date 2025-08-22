# Overview

This is a comprehensive maternal health tracking application built with React, TypeScript, and Express.js. The app provides expectant mothers with tools to monitor their pregnancy journey, including kick counting, weight tracking, birth planning, photo albums, diary entries, and community features. The application features a modern, mobile-first design with a warm color palette optimized for the maternal health experience.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## Complete Password Recovery System (August 22, 2025)
- **Implemented full password recovery flow with real email delivery**
- Configured Gmail SMTP with production credentials (mamacaresup@gmail.com)
- Created professional email template with "Mama Care" branding
- Email recovery request mode with automatic email pre-filling from login
- Token-based password reset system with secure token generation
- Password reset mode with token verification and new password setting
- Added consistent animated background and glass effects across all recovery pages
- Real email delivery working with proper authentication and error handling
- Resend email functionality and proper validation for all steps
- User experience: Complete recovery flow from email input → email delivery → token verification → password reset

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI components
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Session-based authentication with context provider pattern
- **Mobile-First Design**: Responsive design with bottom navigation optimized for mobile usage

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express-session for user authentication
- **File Upload**: Uppy integration with object storage capabilities
- **API Design**: RESTful API endpoints with consistent error handling and logging middleware

## Database Design
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Comprehensive pregnancy tracking schema including:
  - Users and authentication
  - Pregnancy records with due dates
  - Kick counts with timestamped tracking
  - Weight records with historical data
  - Birth plans with customizable preferences
  - Photo albums with metadata
  - Diary entries with mood tracking
  - Symptoms and medications tracking
  - Community features (posts, comments, likes)

## Authentication & Authorization
- **Session-based Authentication**: Uses express-session with secure cookie configuration
- **Protected Routes**: Middleware-based route protection requiring authentication
- **User Registration**: Email-based registration with password hashing (bcryptjs)
- **Object-level ACL**: Custom access control list system for file storage permissions

## File Storage Integration
- **Cloud Storage**: Google Cloud Storage integration with Replit sidecar
- **Upload Management**: Uppy dashboard for file uploads with progress tracking
- **Access Control**: Custom ACL policies for object-level permissions
- **Direct Upload**: Presigned URL pattern for direct-to-cloud uploads

## Key Features Architecture
- **Pregnancy Tracking**: Week-based progression with trimester calculations
- **Kick Counter**: Real-time tracking with session storage and database persistence
- **Weight Monitoring**: Historical tracking with chart visualization (Recharts)
- **Birth Plan Generator**: PDF generation capabilities with customizable templates
- **Community Platform**: Social features with posts, comments, and engagement
- **Photo Album**: Image storage with pregnancy week tagging
- **Symptom & Medication Tracking**: Healthcare data management with severity tracking

# External Dependencies

## Core Technologies
- **React & TypeScript**: Frontend framework and type safety
- **Express.js**: Backend web framework
- **PostgreSQL**: Primary database via Neon Database serverless
- **Drizzle ORM**: Database toolkit and migration system

## UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives (@radix-ui/*)
- **Recharts**: Chart library for data visualization
- **Lucide React**: Icon library

## Cloud Services
- **Google Cloud Storage**: File storage and management (@google-cloud/storage)
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)

## File Upload & Management
- **Uppy**: File upload library with dashboard (@uppy/*)
- **PDF Generation**: jsPDF for birth plan document generation

## Development Tools
- **Vite**: Build tool and development server
- **ESBuild**: JavaScript bundler for production builds
- **TanStack React Query**: Server state management
- **Wouter**: Lightweight routing library
- **Zod**: Runtime type validation with Drizzle integration

## Authentication & Security
- **bcryptjs**: Password hashing
- **express-session**: Session management
- **Session store**: In-memory session storage (development)

## Additional Libraries
- **React Hook Form**: Form state management with validation
- **Class Variance Authority**: Component variant management
- **Nanoid**: URL-safe ID generation