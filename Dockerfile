FROM node:20-alpine AS builder
WORKDIR /opt/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /opt/app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337

COPY --from=builder /opt/app ./

EXPOSE 1337
CMD ["npm", "start"]