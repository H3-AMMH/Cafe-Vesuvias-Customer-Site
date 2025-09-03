FROM node:20

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies (prebuilt sqlite3 binaries usually just work here)
RUN npm install

# Copy source
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]