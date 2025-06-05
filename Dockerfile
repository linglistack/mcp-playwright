# Use Node.js with Playwright pre-installed
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd frontend && npm install

# Install Playwright browsers
RUN npx playwright install

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Expose ports
EXPOSE 3001 8931

# Create startup script
COPY start-services.sh ./
RUN chmod +x start-services.sh

# Start both services
CMD ["./start-services.sh"] 