FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Command is overridden by docker-compose
CMD ["npm", "start"]
