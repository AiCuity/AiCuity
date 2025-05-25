# Multi-stage build for optimized Docker image
FROM node:18-slim AS base

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create and activate virtual environment, then install Python dependencies
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip3 install --no-cache-dir ebooklib beautifulsoup4 lxml

# Create app directory
WORKDIR /app

# Copy package.json files for both client and server
FROM base AS dependencies
COPY package*.json ./
COPY src/server/package*.json ./server/
RUN npm install
WORKDIR /app/server
RUN npm install
WORKDIR /app

# Build stage for client
FROM dependencies AS build
COPY . .
RUN npm run build

# Final stage for production
FROM base AS production
WORKDIR /app

# Copy built client files and server files
COPY --from=build /app/dist ./client/dist
COPY --from=build /app/server ./server
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/server/node_modules ./server/node_modules

# Create necessary directories
RUN mkdir -p ./server/uploads ./server/scripts

# Copy Python scripts
COPY src/server/scripts ./server/scripts/

# Make Python scripts executable
RUN chmod +x ./server/scripts/*.py

# Expose ports (React app and Express server)
EXPOSE 8080
EXPOSE 5000

# Start command will be defined in docker-compose
CMD ["sh", "-c", "cd /app/server && npm start & cd /app/client && npm run preview"]
