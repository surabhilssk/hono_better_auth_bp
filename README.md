# Hono Better Auth Boilerplate

A comprehensive boilerplate for building serverless APIs with Hono.js, `better-auth` for authentication, Prisma ORM with Accelerate, and deployed on Cloudflare Workers. This project provides a robust foundation for quickly spinning up secure and scalable backend services.

![GitHub Stars](https://img.shields.io/github/stars/surabhilssk/hono_better_auth_bp?style=social) ![Build Status](https://github.com/surabhilssk/hono_better_auth_bp/workflows/CI/badge.svg) ![License](https://img.shields.io/badge/License-MIT-blue.svg)

## Table of Contents

- [Key Features](#key-features)

- [Architecture Overview](#architecture-overview)

- [Tech Stack](#tech-stack)

- [Getting Started](#getting-started)

  - [Prerequisites](#prerequisites)

  - [Installation](#installation)

- [Configuration](#configuration)

- [Usage](#usage)

- [Project Structure](#project-structure)

- [Scripts](#scripts)

- [Roadmap](#roadmap)

- [Contributing](#contributing)

- [Testing](#testing)

- [License](#license)

- [Acknowledgements](#acknowledgements)

## Key Features

-   **Hono.js Framework**: A lightweight, fast, and edge-optimized web framework for Cloudflare Workers.

-   **`better-auth` Integration**: Seamless authentication solution with email/password support out-of-the-box.

-   **Prisma ORM**: Type-safe database access with a powerful ORM.

-   **Prisma Accelerate**: Enhanced database performance and connection management for serverless environments.

-   **Cloudflare Workers Deployment**: Optimized for the Cloudflare edge network, ensuring low latency and high availability.

-   **TypeScript Support**: Fully typed codebase for improved developer experience and reduced errors.

-   **Boilerplate Structure**: Ready-to-use setup for rapid development.

## Architecture Overview

This boilerplate leverages a serverless architecture, with Hono.js acting as the API gateway running on Cloudflare Workers. Incoming requests are handled by Hono, which then routes authentication-related requests to the `better-auth` middleware. `better-auth` utilizes Prisma ORM, extended with Prisma Accelerate, to interact with a PostgreSQL database. This setup ensures that database connections are efficiently managed in a serverless context, providing high performance and scalability without the need for traditional server infrastructure. The entire application is written in TypeScript, offering strong typing and maintainability.

## Tech Stack

| Area | Tool | Version |
|---|---|---|
| Web Framework | Hono.js | 4.9.8 |
| Authentication | better-auth | 1.3.13 |
| ORM | Prisma | 6.16.2 |
| Database Extension | @prisma/extension-accelerate | 2.0.2 |
| Deployment | Cloudflare Workers | N/A |
| CLI | Wrangler | 4.4.0 |
| Language | TypeScript | ESNext |



## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/en/) (v18.x or higher recommended)

-   [npm](https://www.npmjs.com/) (comes with Node.js), [Yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)

-   A [Cloudflare account](https://www.cloudflare.com/) (for deployment)

-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/) (Cloudflare Workers CLI)
-   A PostgreSQL database (e.g., via [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or a self-hosted instance).

### Installation

1.  Clone the repository:

```bash
git clone https://github.com/surabhilssk/hono_better_auth_bp.git

cd hono_better_auth_bp

```
2.  Install dependencies:

```bash
npm install

# or yarn install
    # or pnpm install

```
3.  Set up your Prisma schema and generate client:

    Create a `prisma/schema.prisma` file (if not already present) and define your database schema. For `better-auth`, you'll typically need user and session models.

```prisma
// prisma/schema.prisma

generator client {
provider = "prisma-client-js"
output   = "../src/generated/prisma/edge" // Ensure this path matches your setup
}

datasource db {
provider = "postgresql"
url      = env("DATABASE_URL")
directUrl = env("DIRECT_URL")
}

model User {
  id            String    @id
  name          String
  email         String
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @default(now()) @updatedAt
  sessions      Session[]
  accounts      Account[]

  @@unique([email])
  @@map("user")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@map("account")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @default(now()) @updatedAt

  @@map("verification")
}

```
Then, generate the Prisma client:

```bash
npx prisma generate --no-engine
```
And apply migrations to your database:

```bash
npx prisma migrate dev --name init
```
## Configuration

This project relies on environment variables for sensitive information and configuration. You'll typically configure these in a `.env` file for local development and via Cloudflare Workers secrets for deployment.

| ENV | Description | Example |
|---|---|---|
| `DIRECT_URL` | Connection string for your PostgreSQL database (required by Prisma for migrating the database). | `postgresql://user:password@host:port/database?schema=public` |



For local development, create a `.env` file in the root of your project:

```
DIRECT_URL="postgresql://user:password@host:port/database?schema=public"
```
Also, create a `wrangler.jsonc` file in the root of your project:
```
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "better-auth-backend",
  "main": "src/index.ts",
  "compatibility_date": "2025-09-21",
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "vars": {
    "DATABASE_URL":"prisma://accelerate.prisma-data.net/?api_key=nasdnfdsajfhfads", #prisma accelerate url of your database
    "BETTER_AUTH_SECRET":"" , #generate a secret from Better Auth
    "BETTER_AUTH_URL":"http:localhost:3000" #Base url of your app
  },
}
```
For deployment to Cloudflare Workers, set these variables as secrets using the Wrangler CLI:

```bash
wrangler secret put DATABASE_URL
```
## Usage

### Local Development

To start the local development server using Wrangler:

```bash
npm run dev
```
This will typically start a server at `http://localhost:8787`. You can then interact with your API endpoints. The `better-auth` routes will be available under `/api/auth/*`.

### Deployment

To deploy your Worker to Cloudflare:

```bash
npm run deploy
```
This command will build your project and deploy it to your Cloudflare account. Ensure you have configured your `wrangler.jsonc` file with your Cloudflare account ID and project name.

```
## Project Structure
```
.

├── src/
│   ├── lib/

│   │   └── auth.ts          # better-auth initialization and configuration
│   └── index.ts             # Main Hono application entry point

├── prisma/
│   └── schema.prisma        # Prisma database schema definition

├── package.json             # Project dependencies and scripts
├── package-lock.json        # Locked dependency versions

├── tsconfig.json            # TypeScript compiler configuration
└── wrangler.jsonc           # Cloudflare Workers configuration


## Contributing
Contributions are welcome! If you have suggestions, bug reports, or want to improve the codebase, please open an issue or submit a pull request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## Testing

As a boilerplate, this project does not include extensive tests by default. Users are encouraged to add their own unit, integration, and end-to-end tests as they build out their application.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details (placeholder, assume MIT).

## Acknowledgements

-   [Cloudflare Workers](https://workers.cloudflare.com/) for providing an excellent serverless platform.

-   [Hono.js](https://hono.dev/) for the fast and lightweight web framework.

-   [better-auth](https://better-auth.com/) for the flexible authentication solution.

-   [Prisma](https://www.prisma.io/) for the powerful and type-safe ORM.

-   [Prisma Accelerate](https://www.prisma.io/accelerate) for optimizing database access in serverless environments.
