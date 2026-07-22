# Base image
FROM node:18-alpine

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

# Set Node environment to development
ENV NODE_ENV=development

# Start the application
CMD ["npm", "run", "dev"]
