# Computing Society Bot

This is a Discord bot for my University's Computing Society. It includes various commands and features to enhance the server experience.

## Table of Contents

-   [Prerequisites](#prerequisites)
-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Running the Bot](#running-the-bot)
-   [Deploying Commands](#deploying-commands)
-   [PM2 Management](#pm2-management)
-   [Linting and Formatting](#linting-and-formatting)

## Prerequisites

-   [Node.js](https://nodejs.org/) v18 or higher
-   [pnpm](https://pnpm.io/) package manager

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/yourusername/computing-society-bot.git
    cd computing-society-bot
    ```

2. Install the dependencies:

    ```sh
    pnpm install
    ```

## Configuration

1. Copy the `.env.example` file to `.env`:

    ```sh
    cp .env.example .env
    ```

2. Fill in the required environment variables in the `.env` file:

    ```env
    CLIENT_ID="your-client-id"
    GUILD_ID="your-guild-id" # Leave empty to deploy commands globally
    DISCORD_TOKEN="your-discord-token"
    ```

## Running the Bot

To run the bot in development mode:

````sh
pnpm dev


To run the bot in production mode:

```sh
pnpm start
````

## Deploying Commands

To deploy commands to Discord, run:

```sh
pnpm deploy-commands
```

This will register the commands with the Discord API.

## PM2 Management

To manage the bot with PM2, first install PM2 globally:

```sh
pnpm add -g pm2
```

Start the bot with PM2:

```sh
pm2 start ecosystem.config.js
```

You can also use PM2 to monitor and manage the bot's process:

```sh
pm2 status
pm2 logs
pm2 restart ecosystem.config.js
```

## Linting and Formatting

To lint the codebase, run:

```sh
pnpm lint
```

To format the codebase, run:

```sh
pnpm format
```
