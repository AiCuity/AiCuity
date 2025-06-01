# AiCuity - AI-Powered Reading Application

AiCuity is a web application that allows users to extract and read content from websites, PDFs, TXT files, and EPUB files using advanced speed reading technology.

## Features

- Upload and process PDF, TXT, and EPUB files
- Extract text content from websites
- Read content at adjustable speeds with RSVP (Rapid Serial Visual Presentation)
- AI-powered text summarization using OpenAI or Hugging Face models
- Speed calibration tool to find optimal reading speed
- Fullscreen reading mode
- Save reading history and resume from where you left off
- Smart pacing that adjusts speed based on word complexity
- Progress tracking and auto-save functionality
- Duplicate entry cleanup to maintain clean reading history

## Authentication & SSO Setup

This application supports multiple authentication methods through Supabase Auth:

### Supported Authentication Methods

1. **Email/Password**: Traditional email and password authentication
2. **Email Link**: Passwordless authentication via email links (fallback option)
3. **Google OAuth**: Sign in with Google accounts
4. **Microsoft Azure OAuth**: Sign in with Microsoft/Azure accounts

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://syykisxxasxonnhnusts.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OAuth Configuration (configured in Supabase Dashboard)
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Microsoft Azure OAuth  
VITE_AZURE_CLIENT_ID=your_azure_client_id_here
VITE_AZURE_TENANT_ID=your_azure_tenant_id_here

# Stripe Configuration (for premium features)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
VITE_STRIPE_PRICE_ID=your_stripe_price_id_here

# Application URLs
VITE_APP_URL=http://localhost:8080
VITE_PRODUCTION_URL=https://your-domain.com
```

### OAuth Redirect URIs Configuration

Configure the following redirect URIs in your OAuth provider settings:

#### Supabase Auth Callback URLs
- **Development**: `http://localhost:8080/oauth/callback`
- **Production**: `https://your-domain.com/oauth/callback`

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `https://syykisxxasxonnhnusts.supabase.co/auth/v1/callback`
   - Production: `https://your-supabase-project.supabase.co/auth/v1/callback`
6. Add authorized JavaScript origins:
   - Development: `http://localhost:8080`
   - Production: `https://your-domain.com`

#### Microsoft Azure OAuth Setup
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory > App registrations
3. Create a new registration
4. Add redirect URIs under "Authentication":
   - Type: Web
   - Development: `https://syykisxxasxonnhnusts.supabase.co/auth/v1/callback`
   - Production: `https://your-supabase-project.supabase.co/auth/v1/callback`
5. Configure API permissions for Microsoft Graph:
   - `openid`
   - `profile`
   - `email`

#### Supabase Configuration
In your Supabase Dashboard:

1. **Authentication > Settings > Auth Providers**
2. **Google Provider**:
   - Enable Google provider
   - Add your Google Client ID
   - Add your Google Client Secret
   - Redirect URL: `https://your-supabase-project.supabase.co/auth/v1/callback`

3. **Azure Provider**:
   - Enable Azure provider
   - Add your Azure Client ID
   - Add your Azure Client Secret
   - Azure Tenant ID: `your-tenant-id` or `common` for multi-tenant
   - Redirect URL: `https://your-supabase-project.supabase.co/auth/v1/callback`

4. **Site URL Configuration**:
   - Development: `http://localhost:8080`
   - Production: `https://your-domain.com`

5. **Additional Redirect URLs**:
   - `http://localhost:8080/oauth/callback`
   - `https://your-domain.com/oauth/callback`

### Duplicate Email Handling

The application includes comprehensive duplicate email collision handling:

1. **Detection**: Checks if email already exists before registration
2. **Provider Identification**: Attempts to identify which authentication provider was used
3. **Fallback Options**: Provides multiple recovery options:
   - Email link authentication
   - Redirect to sign-in page
   - Clear error messaging about existing accounts
4. **Social Login Hints**: Suggests using social login if account was created with OAuth

### Automatic User Record Creation

- User profiles are automatically created upon successful authentication
- Supports both email/password and OAuth sign-ins
- Profile includes: user ID, email, full name, avatar URL, and timestamps
- Uses upsert operations to handle existing records gracefully

## Database Schema

### Profiles Table
```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
```

## Component Architecture

### Core Reading Components

#### RSVP Reader (`src/components/RSVPReader/`)
- **RSVPReader**: Main reading component with speed-adjustable word display
- **WordDisplay**: Shows words with highlighted focus letters for improved reading
- **ProgressBar**: Visual progress indicator with complexity-based color coding
- **PlaybackControls**: Play/pause, navigation, and smart pacing controls
- **SpeedControl**: WPM adjustment slider with fullscreen toggle
- **KeyboardControls**: Keyboard shortcuts for reading navigation
- **ControlsContainer**: Unified controls layout for all reading functions
- **TitleBar**: Header with title, word count, and navigation
- **ReadingArea**: Central display area for words and progress
- **SourceLink**: Shows source attribution for content
- **NotificationToggle**: Controls for reading notifications
- **RestartButton**: Quick restart functionality

#### Reader Container (`src/components/Reader/`)
- **RSVPReaderContainer**: Wrapper for RSVP reader with content management
- **ContentContainer**: Manages API configuration and summarization
- **ContentHeader**: Header with navigation and content metadata
- **ReaderOptions**: Configuration panel for reading preferences
- **ReaderAlerts**: Displays warnings and reading position alerts
- **LoadingState**: Loading indicator for content processing
- **NotFoundState**: Error state for missing or inaccessible content
- **SummarizePrompt**: Prompts user to generate summary or read full text
- **ContentPreview**: Shows preview of the content to be read

### Summarization System

#### Summary Components
- **SummaryPanel**: Displays generated summaries with reading options
- **ApiKeyConfig**: Configuration for OpenAI/Hugging Face API keys

#### Summarization Hooks
- **useSummarization**: Manages text summarization process and progress
- **Summarization utilities**: OpenAI and Hugging Face integration for text processing

### Calibration System

#### Calibration Components (`src/components/Calibration/`)
- **SpeedCalibrationTool**: Complete speed calibration workflow
- **CalibrationTestDisplay**: Word display during calibration tests
- **CalibrationButton**: Quick access to calibration from anywhere in the app

### Reading History System

#### History Components (`src/components/ReadingHistory/`)
- **ReadingHistory**: Main history dashboard
- **ReadingHistoryTable**: Tabular view of reading sessions
- **EmptyState**: Display when no reading history exists
- **LoadingState**: Loading indicator for history data
- **EntryTitle**: Displays reading session titles
- **ProgressDisplay**: Shows reading progress percentages
- **SourceIcon**: Icons for different content sources
- **TableEntryActions**: Actions menu for history entries
- **DeleteConfirmationDialog**: Confirmation for deleting entries
- **CleanupButton**: Removes duplicate entries based on title, keeping only the most recent

#### History Hooks
- **useReadingHistory**: Main history management hook
- **useProgressSaver**: Auto-saves reading progress
- **useHistoryTracker**: Tracks reading sessions
- **useReaderHistory**: History integration for reader

#### History Operations (`src/hooks/readingHistory/operations/`)
- **duplicateCleanupOperations**: Handles finding and removing duplicate entries by title
- **saveOperations**: Manages saving reading history entries
- **deleteOperations**: Handles deletion of individual entries
- **findOperations**: Utilities for finding existing entries

### Core Hooks

#### RSVP Hooks (`src/hooks/rsvp/`)
- **useRSVPCore**: Core RSVP reading logic
- **useRSVPControls**: Playback and navigation controls
- **useRSVPReadingPosition**: Position tracking and resumption
- **usePlaybackControls**: Play/pause and navigation
- **useSpeedControl**: WPM adjustment and smart pacing
- **useWordFormatting**: Word formatting for optimal reading
- **useSmartPacing**: Adaptive speed based on word complexity
- **useNotifications**: Reading progress notifications
- **useFullscreen**: Fullscreen mode management

#### Utility Hooks
- **useContentLoader**: Loads content from various sources
- **useProfile**: User profile and preferences management
- **useReaderPage**: Main reader page orchestration

### UI Components (`src/components/ui/`)

#### Form Components
- **Button**: Primary action buttons with variants
- **Input**: Text input fields
- **Textarea**: Multi-line text areas
- **Checkbox**: Boolean selection controls
- **RadioGroup**: Single selection from options
- **Slider**: Numeric value selection
- **Progress**: Progress bars and indicators

#### Layout Components
- **Card**: Content containers with headers and footers
- **Collapsible**: Expandable content sections
- **Accordion**: Multi-section expandable content
- **Separator**: Visual content dividers
- **ScrollArea**: Scrollable content regions
- **Resizable**: Adjustable panel layouts

#### Feedback Components
- **Alert**: Information and warning messages
- **Toast**: Temporary notification messages
- **Badge**: Status and category indicators
- **Tooltip**: Contextual help information

#### Navigation Components
- **Breadcrumb**: Navigation path indicators
- **Tabs**: Tabbed content organization

#### Data Display Components
- **Table**: Structured data presentation
- **Avatar**: User profile images
- **HoverCard**: Expandable information cards
- **Popover**: Contextual popup content

## Tech Stack

- Frontend: React with TypeScript
- Backend: Express.js
- Database: Supabase for user data and reading history
- UI Framework: Tailwind CSS with Shadcn UI components
- AI Integration: OpenAI GPT models and Hugging Face Transformers
- File Processing: 
  - PDF: pdf-parse library
  - EPUB: Python script using ebooklib and BeautifulSoup for robust text extraction
  - TXT: Native Node.js fs module
- Containerization: Docker

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- Python 3 with ebooklib (for EPUB processing)
- Docker (optional, for containerized deployment)

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/aicuity.git
   cd aicuity
   ```

2. Install frontend dependencies:
   ```
   npm install
   ```

3. Install backend dependencies:
   ```
   cd src/server
   npm install
   cd ../..
   ```

4. Install Python dependencies for EPUB processing:
   ```
   pip3 install ebooklib beautifulsoup4 lxml
   ```

5. Create a `.env` file in the root directory:
   ```
   VITE_API_URL=http://localhost:5000
   ```

6. Start the backend server:
   ```
   cd src/server
   npm run dev
   ```

7. In a new terminal, start the frontend development server:
   ```
   npm run dev
   ```

8. Access the application at `http://localhost:8080`

### Docker Deployment

1. Build and run with Docker Compose:
   ```
   docker-compose up --build
   ```

2. Access the application at `http://localhost:8080`

Note: Docker images include all necessary Python dependencies including ebooklib for EPUB processing.

## Key Features Explained

### RSVP Reading Technology
The app uses Rapid Serial Visual Presentation (RSVP) to display words sequentially in a fixed position, eliminating eye movement and significantly increasing reading speed while maintaining comprehension.

### Smart Pacing
The system analyzes word complexity (length, syllables, common words) and automatically adjusts reading speed to maintain optimal comprehension.

### AI Summarization
Integrated OpenAI and Hugging Face models provide intelligent text summarization to help users quickly grasp key concepts before detailed reading.

### Reading History & Progress
Automatic saving of reading positions, speeds, and preferences with cloud synchronization via Supabase for seamless experience across devices. Includes duplicate cleanup functionality to maintain clean history by removing older entries with the same title.

### Speed Calibration
Systematic testing with passages of varying difficulty to determine each user's optimal reading speed that balances speed and comprehension.

### Duplicate Entry Management
Built-in cleanup system that identifies and removes duplicate reading history entries based on title, keeping only the most recent entry for each unique title to maintain a clean and organized reading history.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---
### Supabase Site URL

All Supabase e-mail links use **Auth → Settings → URL Configuration → Site URL**.
Set it to the production domain (`https://aicuity.app`)
and add `http://localhost:8080` 'http://localhost:5050` in "Additional Redirect URLs" for local dev.
---

## Admin Dashboard

AiCuity includes a comprehensive admin dashboard for managing users, subscriptions, and system administration.

### Admin Role System

The application supports three user roles:

1. **User**: Standard user with normal application access
2. **Admin**: Can view and manage all users, subscriptions, and usage limits
3. **Super Admin**: All admin privileges plus ability to invite/promote other admins

### Admin Features

#### User Management
- View all registered users in a comprehensive table
- See user details including email, registration date, last sign-in
- Manage user roles (promote to admin, demote from admin)
- View and edit user subscription tiers
- Adjust user usage limits and book quotas

#### Subscription Management  
- View all user subscriptions and their status
- Change subscription tiers for any user
- Adjust books limits manually
- Monitor subscription statuses (active, canceled, trial, etc.)

#### Usage Tracking
- View current month usage for all users
- Increment/decrement usage counts manually
- Monitor total platform usage statistics

#### Admin Invitations
- Super admins can invite new users directly as admins
- Send invitation emails via Supabase Auth
- Automatic role assignment for invited admins

### Setup Instructions

#### 1. Run Database Migration

First, apply the admin roles migration:

```bash
# Apply the migration to add admin roles
supabase db push
```

This will add:
- `role` column to the profiles table
- Admin-specific RLS policies
- Helper functions for admin operations
- Admin user overview view

#### 2. Create First Super Admin

After deploying, create your first super admin user:

```bash
# 1. Sign up normally through the app UI first
# 2. Then run the setup script with your email:
node scripts/create-super-admin.js your-email@example.com
```

Alternatively, you can promote a user manually via SQL:

```sql
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'your-email@example.com';
```

#### 3. Environment Variables

Add the service role key to your environment:

```env
# Required for admin setup script
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Accessing the Admin Dashboard

Once you have admin privileges:

1. Sign in to your account
2. The "Admin Dashboard" button will appear in the top navigation
3. Navigate to `/admin` or click the button
4. Access all admin features from the dashboard

### Security Features

#### Row Level Security (RLS)
- All admin operations are protected by RLS policies
- Only users with admin/super_admin roles can access admin data
- Automatic permission checking on all database operations

#### Role-Based Access Control
- Admin functions are only visible to admin users
- Super admin functions require super_admin role
- Automatic role verification for all admin operations

#### Audit Trail
- All admin actions are logged with timestamps
- User modification history is tracked
- Subscription changes are recorded

### Admin API Functions

The admin system includes several SQL functions:

- `is_admin()`: Check if current user is admin
- `promote_to_admin(user_id)`: Promote user to admin (super_admin only)
- Admin user overview view for efficient querying

### Admin Dashboard Components

#### AdminUserTable
- Displays all users with pagination
- Inline editing of user properties
- Quick actions for common admin tasks
- Real-time usage adjustment controls

#### AdminInviteForm  
- Send admin invitations by email
- Validation and error handling
- Success confirmations

#### Statistics Dashboard
- Total users, active subscriptions, admin count
- Current month usage statistics
- Visual charts and metrics

### Best Practices

1. **Always have at least one super admin** to prevent lockout
2. **Use admin invitations** rather than manual role changes when possible
3. **Monitor usage patterns** to identify potential abuse
4. **Regularly review admin user list** and remove inactive admins
5. **Test admin functions** in development before production changes

### Troubleshooting

#### Cannot Access Admin Dashboard
- Verify your user role in the database: `SELECT role FROM profiles WHERE email = 'your-email';`
- Check if RLS policies are properly applied
- Ensure you're signed in and have refreshed the page

#### Admin Functions Not Working
- Verify environment variables are set correctly
- Check Supabase logs for RLS policy violations
- Ensure service role key has proper permissions

#### Users Not Appearing in Admin View
- Check if admin_user_overview view exists and has proper permissions
- Verify RLS policies allow admin access to all tables
- Confirm user profiles were created properly during signup

---
