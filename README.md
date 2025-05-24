
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

#### History Hooks
- **useReadingHistory**: Main history management hook
- **useProgressSaver**: Auto-saves reading progress
- **useHistoryTracker**: Tracks reading sessions
- **useReaderHistory**: History integration for reader

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
  - EPUB: Python script using zipfile and ElementTree
  - TXT: Native Node.js fs module
- Containerization: Docker

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- Python 3 (for EPUB processing)
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

4. Create a `.env` file in the root directory:
   ```
   VITE_API_URL=http://localhost:5000
   ```

5. Start the backend server:
   ```
   cd src/server
   npm run dev
   ```

6. In a new terminal, start the frontend development server:
   ```
   npm run dev
   ```

7. Access the application at `http://localhost:8080`

### Docker Deployment

1. Build and run with Docker Compose:
   ```
   docker-compose up --build
   ```

2. Access the application at `http://localhost:8080`

## Key Features Explained

### RSVP Reading Technology
The app uses Rapid Serial Visual Presentation (RSVP) to display words sequentially in a fixed position, eliminating eye movement and significantly increasing reading speed while maintaining comprehension.

### Smart Pacing
The system analyzes word complexity (length, syllables, common words) and automatically adjusts reading speed to maintain optimal comprehension.

### AI Summarization
Integrated OpenAI and Hugging Face models provide intelligent text summarization to help users quickly grasp key concepts before detailed reading.

### Reading History & Progress
Automatic saving of reading positions, speeds, and preferences with cloud synchronization via Supabase for seamless experience across devices.

### Speed Calibration
Systematic testing with passages of varying difficulty to determine each user's optimal reading speed that balances speed and comprehension.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
