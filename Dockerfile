# syntax=docker/dockerfile:1
FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_OPTIONS=--max_old_space_size=1024
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/package.json ./
RUN npm ci --omit=dev
EXPOSE 3000
ENV PORT=3000
CMD ["npm","run","start"]
