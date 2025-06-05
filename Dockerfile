# Use Node.js with Playwright pre-installed
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Set working directory
WORKDIR /app

# Set npm configuration for better reliability
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set fetch-retries 3
RUN npm config set fetch-retry-mintimeout 10000
RUN npm config set fetch-retry-maxtimeout 60000

# Copy package files first for better Docker layer caching
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies with clean slate
RUN npm cache clean --force
RUN npm ci --only=production --no-optional
RUN cd frontend && npm cache clean --force && npm ci --only=production --no-optional

# Install Playwright browsers and dependencies
RUN npx playwright install --with-deps chromium

# Copy source code
COPY . .

# Build frontend for production
RUN cd frontend && npm run build

# Create non-root user for security
RUN useradd -m -s /bin/bash playwright
RUN chown -R playwright:playwright /app
USER playwright

# Expose ports
EXPOSE 3001

# Make startup script executable
USER root
RUN chmod +x start-services.sh
USER playwright

# Start both services
CMD ["./start-services.sh"] 