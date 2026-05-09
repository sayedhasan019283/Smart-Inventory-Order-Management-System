FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY tsconfig.json ./
COPY src ./src

EXPOSE 5673
ENV NODE_ENV=development

# Use ts-node-dev for hot reload during development
CMD ["npm", "run", "dev"]
