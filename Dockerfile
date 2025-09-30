FROM node:22.20.0

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the port your app listens on
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
