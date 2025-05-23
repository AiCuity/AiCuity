
# AiCuity - AI-Powered Reading Application

AiCuity is a web application that allows users to extract and read content from websites, PDFs, TXT files, and EPUB files using advanced speed reading technology.

## Features

- Upload and process PDF, TXT, and EPUB files
- Extract text content from websites
- Read content at adjustable speeds
- Fullscreen reading mode
- Save reading history

## Tech Stack

- Frontend: React with TypeScript
- Backend: Express.js
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

## License

This project is licensed under the MIT License - see the LICENSE file for details.
