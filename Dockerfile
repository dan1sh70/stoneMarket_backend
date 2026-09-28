# Base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (only production deps)
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Set environment variables with defaults
ENV NODE_ENV=development
ENV PORT=5000
ENV MONGO_URI=mongodb://localhost:27017/stonemarket_test
ENV JWT_SECRET=supersecretkey
ENV JWT_EXPIRY=7d

# Start the application
CMD ["npm", "run", "dev"]
