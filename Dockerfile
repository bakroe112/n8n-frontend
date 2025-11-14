# ---------- build ----------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# tùy chọn: ghi đè API khi build
ARG VITE_API_BASE_URL
RUN if [ -n "$VITE_API_BASE_URL" ]; then echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" > .env.production; fi
RUN npm run build

# ---------- run ----------
FROM node:20-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000 >/dev/null 2>&1 || exit 1
CMD ["serve","-s","dist","-l","3000"]
