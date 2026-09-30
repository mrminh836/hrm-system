# Multi-stage build or lightweight node alpine with non-root security hardening
FROM node:22-alpine AS production

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install dependencies first for Docker layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY docs/ ./docs/

# Security Hardening: Ensure non-root ownership and run as non-root user "node"
RUN chown -R node:node /app
USER node

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "backend/src/server.js"]
