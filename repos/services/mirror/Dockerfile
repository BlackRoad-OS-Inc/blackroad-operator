FROM node:20-slim
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install --production
COPY src/ src/
CMD ["node", "src/index.js"]
