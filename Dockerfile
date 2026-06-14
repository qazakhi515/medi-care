# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install all dependencies (including dev) for the build
COPY package*.json ./
RUN npm ci

# Copy source and build both apps (medicare-api + medicare-batch)
COPY . .
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Only production dependencies in the final image
COPY package*.json ./
RUN npm ci --omit=dev

# Compiled output from the build stage
COPY --from=builder /app/dist ./dist

# Folder for uploaded files (served at /uploads)
RUN mkdir -p uploads

# medicare-api listens on PORT_API (3007), batch on PORT_BATCH (3008)
EXPOSE 3007

# Default: run the API. Override `command` in docker-compose for the batch app.
CMD ["node", "dist/apps/medicare-api/main"]
