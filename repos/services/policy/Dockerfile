FROM node:20-slim
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install --production
COPY src/ src/
CMD ["node", "src/index.js"]
