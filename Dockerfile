# ---- Build stage ----------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (uses the lockfile for reproducible installs).
COPY package.json package-lock.json* ./
RUN npm ci

# Generate the Prisma client and build the Next.js standalone output.
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Runtime stage --------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy the standalone server, static assets and Prisma runtime.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["node", "server.js"]
