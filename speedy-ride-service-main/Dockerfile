# ---- Stage 1: Build ----
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy rest of source and build
COPY . .
RUN npm run build

# ---- Stage 2: Serve with Nginx ----
FROM nginx:1.27-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from stage 1
COPY --from=build /app/dist /usr/share/nginx/html
# (use /app/dist instead of /app/build if you're on Vite)

# Optional: custom nginx config for SPA routing (React Router etc.)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]