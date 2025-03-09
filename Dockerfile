# Use Node.js as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app will run on
EXPOSE 8080

# Set NODE_ENV
ENV NODE_ENV=production

# Command to run the application
CMD ["npm", "start"]