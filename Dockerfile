# Use an official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install sqlite3 dependencies
RUN apk add --no-cache python3 make g++ sqlite

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port (adjust if your app uses a different one)
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
