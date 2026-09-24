FROM oven/bun:1
WORKDIR /app
ENV NODE_ENV=production
COPY package.json bun.lock ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile && bunx prisma generate --schema prisma/postgres/schema.prisma
COPY . .
RUN DATABASE_URL="file:./build-placeholder.db" bun run build
COPY docker/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["bun","server.js"]
