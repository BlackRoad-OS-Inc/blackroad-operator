FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production && npm cache clean --force
COPY server.js ./
EXPOSE 4010
CMD ["node", "server.js"]
