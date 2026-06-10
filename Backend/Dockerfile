FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

ENV DATABASE_URL="postgresql://bcb:bcb123@postgres:5432/bcb?schema=public"

RUN npm ci --ignore-scripts
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
