# Use a lightweight Node.js base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy only the package.json and package-lock.json to the container
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the application code
COPY . .

# Expose the application port
EXPOSE 3003

# Command to start the application
CMD ["node", "index.js"]
