
# Use a Node.js base image
FROM node:18-slim

# Install Python and pip
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create app directory for client
WORKDIR /app/client

# Copy client package.json and package-lock.json
COPY package*.json ./

# Install client dependencies
RUN npm install

# Copy client source code
COPY . .

# Create app directory for server
WORKDIR /app/server

# Copy server package.json and package-lock.json
COPY src/server/package*.json ./

# Install server dependencies
RUN npm install

# Copy server source code
COPY src/server .

# Create uploads directory
RUN mkdir -p uploads

# Create scripts directory
RUN mkdir -p scripts

# Copy Python scripts
COPY src/server/scripts ./scripts/

# Make Python scripts executable
RUN chmod +x ./scripts/epub_converter.py

# Expose ports (React app and Express server)
EXPOSE 8080
EXPOSE 5000

# Start both applications
CMD ["sh", "-c", "cd /app/client && npm run build && npm run preview & cd /app/server && npm start"]
