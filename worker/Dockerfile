# -------------------------------------------------------------------------
# Visual Studio - Cloud Run Rendering Worker Dockerfile
# Native FFmpeg + Puppeteer/HyperFrames HTML Render + Node.js 20
# -------------------------------------------------------------------------

FROM node:20-bookworm-slim

# Install FFmpeg, fonts, and Chromium runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    fonts-noto-color-emoji \
    fonts-noto-cjk \
    fonts-liberation \
    fonts-roboto \
    fontconfig \
    ca-certificates \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcups2 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production and build dependencies
RUN npm ci

# Copy application source code
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript
RUN npm run build

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Cloud Run listens on PORT
EXPOSE 8080

CMD ["node", "dist/index.js"]
