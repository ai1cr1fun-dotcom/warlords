FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile && bunx prisma generate --schema prisma/postgres/schema.prisma
COPY . .
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
RUN DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build" bun run build
COPY docker/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh
USER bun
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["bun",".next/standalone/server.js"]
