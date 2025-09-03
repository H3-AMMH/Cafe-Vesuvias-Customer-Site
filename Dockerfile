# Use official Node.js Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install build tools and sqlite
RUN apk add --no-cache make g++ python3 sqlite

# Copy package files first for caching
COPY package*.json ./

# Install dependencies, but build sqlite3 from source for Alpine
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port (adjust if needed)
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
