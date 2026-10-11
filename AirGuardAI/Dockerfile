# AirGuard AI Production Dockerfile for AWS App Runner / ECS
FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --production

COPY . .

RUN npm run build || echo "Build handled by runner"

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]
