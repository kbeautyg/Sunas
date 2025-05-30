FROM node:20

# Создаём рабочую директорию
WORKDIR /app

# Кэшируем deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate \
 && pnpm i --frozen-lockfile

# Копируем всё остальное
COPY . .

# Собираем бэкенд
RUN pnpm --filter backend build

# Запускаем именно backend (он слушает PORT, который выдаст Railway)
CMD ["pnpm", "--filter", "backend", "start"]
