# LeadEstate CRM Platform

## Overview

LeadEstate is a comprehensive CRM platform designed for real estate agencies to manage leads, properties, projects, and sales operations. The application is built with Next.js and follows a multi-tenant SaaS architecture where agencies can subscribe to different plans, manage their teams, and track their real estate business operations.

The platform serves two primary user groups:
1. **Administrators** - Manage agencies, subscriptions, plans, and system-wide operations
2. **Agency Users** - Manage leads, properties, projects, team members, and client interactions

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**October 21, 2025 - Major Frontend Redesign**
- Implemented complete modern design system with CSS variables, gradients, and animations
- Redesigned all landing page components (Header, Hero, Services, Features, About, Pricing, Testimonials, Contact, Footer) with modern aesthetic
- Updated dashboard layouts for both admin and agency with unified modern design
- Created new modern KPI cards with gradient icons and hover effects
- Added comprehensive dashboard styling components (ModernDashboard.module.css, ModernKpiCard.module.css, ModernDashboardPages.module.css)
- Maintained all existing functionality - only frontend/UI changes, no backend modifications

## System Architecture

### Frontend Architecture

**Framework**: Next.js 14 with TypeScript and React 18
- Server-side rendering (SSR) for improved SEO and initial page load
- Static generation where applicable
- API routes for backend functionality
- TypeScript for type safety across the codebase

**UI Components**:
- React Bootstrap for UI components
- Custom CSS modules for component-specific styling
- Multiple design systems (Cozy theme, Modern theme) for different sections
- Responsive design using Bootstrap grid system
- Custom modal components for CRUD operations

**State Management**:
- React Context API for notifications system
- Next-Auth sessions for authentication state
- Local component state for UI interactions

**Routing**: 
- Next.js file-based routing
- Role-based access control with custom HOCs (`withAuth`, `withApiAuth`)
- Separate route structures for admin (`/admin/*`) and agency (`/agency/*`) users

### Backend Architecture

**Database ORM**: Prisma Client
- Type-safe database queries
- Migration management
- Database seeding capabilities
- Support for complex relations and queries

**Authentication & Authorization**:
- NextAuth.js for authentication
- Multiple providers: Credentials and Firebase (Google Sign-In)
- Session-based authentication
- Role-based access control (ADMIN, AGENCY_OWNER, AGENCY_MANAGER, AGENCY_MEMBER)
- Prisma adapter for session storage

**API Design**:
- RESTful API routes in `/pages/api/*`
- Protected routes using `withApiAuth` wrapper
- CRUD operations for all major entities (leads, properties, users, agencies, etc.)
- Bulk operations support (bulk delete, bulk status update, bulk property updates)
- File upload handling for property images

**Business Logic**:
- Subscription management with trial period support
- Plan-based user and prospect limits
- Lead status workflow (NEW → CONTACTED → APPOINTMENT_SCHEDULED → WON/LOST)
- Property status management (A_VENDRE, VENDU, LOUE, etc.)
- Agent assignment and notification system

### Data Storage

**Primary Database**: 
- Uses Prisma ORM (schema-driven approach)
- Supports SQLite for development (dev.db)
- Production-ready for PostgreSQL/MySQL migration
- Complex relational data model with cascading deletes and updates

**Key Data Models**:
- **User**: Multi-role support, agency association
- **Agency**: Multi-tenant isolation, plan association, country/city info
- **Lead**: Comprehensive prospect tracking with status, assigned agent, notes, activities
- **Property**: Detailed property information with images, projects, and lead associations
- **Project**: Property groupings by development/project
- **Subscription**: Plan management, trial periods, status tracking
- **Plan**: Feature-based pricing with limits
- **Ticket**: Support system with messages
- **Notification**: User notification system

**File Storage**: Firebase Storage
- Property images uploaded to Firebase Storage buckets
- Image URLs stored in database
- Upload progress tracking
- Multiple image support per property

### External Dependencies

**Authentication Services**:
- Firebase Authentication for Google Sign-In
- Firebase Admin SDK for server-side token verification
- NextAuth for session management and credential-based auth

**Payment Processing**:
- PayPal integration via `@paypal/react-paypal-js`
- Subscription payment handling
- Plan upgrade/downgrade support

**Communication Services**:
- Brevo (formerly Sendinblue) API integration via `@getbrevo/brevo`
- SMS notifications via Zapier webhook integration
- Email capabilities for lead notifications

**Third-Party Libraries**:
- **bcryptjs**: Password hashing
- **chart.js & recharts**: Data visualization and analytics
- **FullCalendar**: Calendar view for appointments and showings
- **react-leaflet & leaflet**: Map integration for property locations
- **react-phone-number-input**: International phone number input
- **csv-parser**: CSV import for bulk lead creation
- **formidable**: Multipart form data parsing for file uploads
- **date-fns**: Date manipulation and formatting
- **uuid**: Unique identifier generation

**Development Dependencies**:
- **ESLint**: Code quality and Next.js-specific linting
- **TypeScript**: Type checking and development tooling

**Hosting & Deployment Considerations**:
- Configured for port 5000 on host 0.0.0.0
- CORS configuration for API access (cors.json)
- Firebase Storage CORS rules
- Environment variables for API keys and secrets

**Analytics & Monitoring**:
- Firebase Analytics integration
- Custom notification system with sound alerts
- Activity logging for lead interactions