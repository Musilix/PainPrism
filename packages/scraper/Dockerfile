# Start from the official Playwright image. 
# Gives us the binaries we need for our scraper to properly go browser huntin'
# The version here should match the version in our package.json
FROM mcr.microsoft.com/playwright:v1.45.1

# Set our working directory inside the container
WORKDIR /app

# Copy our package.json and pnpm-lock.yaml to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install our app's dependencies
RUN pnpm install

# Copy the rest of our scraper code
COPY . .

# The command to run when the container starts
CMD ["pnpm", "scrape"]