# Overview

This is a comprehensive maternal health tracking application built with React, TypeScript, and Express.js. The app provides expectant mothers with tools to monitor their pregnancy journey, including kick counting, weight tracking, birth planning, photo albums, diary entries, and community features. The application features a modern, mobile-first design with a warm color palette optimized for the maternal health experience.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## Sistema de Imagens para Desenvolvimento do Bebê Implementado (Setembro 02, 2025)
- **Campo fruit_image_url adicionado à tabela baby_development**:
  - Novo campo para armazenar URLs de imagens das frutas/grãos de comparação
  - Campo adicionado automaticamente via ALTER TABLE no banco PostgreSQL
  - Sistema funciona com imagens anexadas via @assets/filename.extension
- **Sistema automatizado de inserção de imagens realistas**:
  - Mapeamento completo de frutas/objetos para imagens sem fundo
  - Endpoint POST /api/baby-development/auto-insert-images para inserção automática
  - Sistema busca comparações no banco e associa imagens correspondentes
  - Imagens realistas incluem: grão de areia, alfinete, chia, papoula, framboesa, lima, limão, banana, milho, berinjela
- **APIs criadas para gerenciamento de imagens**:
  - POST /api/baby-development/add-image-field - Adiciona campo fruit_image_url
  - POST /api/baby-development/auto-insert-images - Sistema automatizado completo
  - GET /api/public/baby-development/comparisons - Visualizar comparações (sem autenticação)
  - Endpoints individuais para semanas específicas (1, 2, 3) mantidos para compatibilidade
  - Sistema escalável para adicionar imagens de todas as semanas gestacionais

## Complete User Activity Logging System Implemented (August 27, 2025)
- **Analytics tables successfully created in Supabase database**:
  - `user_analytics` - Tracks all user actions, clicks, page views, timestamps
  - `access_logs` - Records login/logout attempts and authentication events
  - `user_sessions` - Monitors session duration and user engagement
  - Tables auto-created on server startup with proper SQL structure
- **Comprehensive activity tracking now operational**:
  - Weight registration logs automatically with exact timestamps
  - Every user action recorded with user ID, session ID, page, and metadata
  - **Login/logout events logged in access_logs table**
  - Endpoint `/api/user-logs` provides complete activity history
  - Real-time logging of user behavior patterns and app usage
- **Database integration fully functional**:
  - PostgreSQL tables created using direct SQL execution
  - Storage methods implemented for all CRUD operations
  - Auto-initialization prevents missing table errors
  - Full compatibility with existing weight tracking system

## UI/UX Overhaul - Complete Sidebar Removal (August 27, 2025)
- **Completely removed sidebar navigation system**:
  - Removed Sidebar component from Layout.tsx
  - Removed all lateral menu functionality for mobile and desktop
  - Interface now uses only page-based navigation through dashboard
  - All features accessible through grid-based colored buttons on main dashboard page
  - Clean, sidebar-free interface optimized for mobile-first experience
  - Analytics menu item removed from user interface (September 02, 2025)
- **Weight tracking system rebuilt**:
  - Fixed weight registration with new weight_entries table
  - Added proper date field to weight registration form
  - Updated API endpoints to use /api/weight-entries
  - Corrected database schema for weight tracking functionality
- **Enhanced mobile-first design**:
  - Improved bottom navigation with functional buttons
  - Optimized for mobile interaction patterns
  - Color-coded feature buttons for better visual hierarchy
  - Consistent gradient design across all interface elements

## Full Authentication System Working with Supabase (August 23, 2025)
- **Complete Supabase integration operational**:
  - Database connection established and stable
  - RLS policies disabled for user operations
  - Drizzle ORM successfully inserting and querying users
  - Users table fully functional with proper schema including created_at
- **Authentication system confirmed working**:
  - User registration: Creates users in Supabase database
  - User login: Validates credentials against Supabase data
  - Password hashing: bcryptjs working correctly (60-character hashes)
  - Session management: Express-session storing user sessions
  - **Duplicate user prevention**: Fixed registration system preventing duplicate emails
- **Password recovery system fully operational**:
  - 4-digit numerical verification codes (not UUIDs)
  - HTML email templates with Mama Care branding
  - Combined token verification and password reset interface
  - Gmail SMTP confirmed delivering emails successfully
  - Password updates working correctly in Supabase database
  - Login works immediately after password reset
- **User Analytics System Implemented**:
  - User creation date tracking (created_at column added)
  - Comprehensive analytics system for tracking user behavior
  - User sessions tracking with start/end times and duration
  - Analytics logging for page views, clicks, and user interactions
  - Database tables: user_analytics, user_sessions, access_logs
- **Database structure verified**:
  - Users table: id (VARCHAR), email (TEXT), password (TEXT), name (TEXT), created_at (TIMESTAMP)
  - Password hashes properly stored (60 characters, bcrypt format)
  - Email uniqueness enforced at database level
  - All CRUD operations working through Drizzle ORM

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