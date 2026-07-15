FROM node:20-bullseye-slim

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Install python dependencies
# Note: --break-system-packages is sometimes required on newer debian bases 
# when not using venv, but bullseye uses Python 3.9 where it's not strictly enforced yet.
RUN pip3 install python-pptx Pillow

WORKDIR /app

# Copy package.json and install Node dependencies
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install

# Copy all files
COPY . .

# Build the project
RUN pnpm build

# Expose port (Render/Railway default behavior)
EXPOSE 5000

# Start command
CMD ["npm", "start"]
