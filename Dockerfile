# ==============================================================================
# StringArt Frontend — Production Cloud Run Dockerfile
# Multi-stage build: Node.js 20 Alpine builder -> Nginx Alpine runner
# ==============================================================================

# Stage 1: Build React SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies cleanly
COPY package*.json ./
RUN npm ci

# Copy frontend source code
COPY . .

# Build-time argument for backend API URL
# Example: docker build --build-arg VITE_API_BASE_URL=https://backend-xyz.run.app .
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Compile production bundle into /app/dist
RUN npm run build

# Stage 2: Serve static assets with Nginx
FROM nginx:alpine

# Default Cloud Run PORT environment variable
ENV PORT=8080

# Remove default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Cloud Run template config ($PORT is substituted at container launch)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 8080

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
