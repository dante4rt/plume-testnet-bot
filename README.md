# Plume Testnet Bot

## Description

Plume Testnet Bot is an application designed to interact with the Plume Network faucet on the testnet. It allows users to claim tokens (ETH) using their wallet address. The bot uses the Ethers.js library for Ethereum interactions and Axios for HTTP requests.

## Features

- Claim ETH tokens from the Plume testnet faucet.
- Automatically handles transactions and errors.
- Provides real-time feedback and transaction details.

## Requirements

- Node.js
- `npm` or `yarn` for package management
- `.env` file for storing sensitive information

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/dante4rt/plume-testnet-bot.git
    ```

2. Navigate into the project directory:

    ```bash
    cd plume-testnet-bot
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Create a `.env` file in the root directory of the project. Add your private key to this file with the following format:

    ```
    PRIVATE_KEY=your_private_key_here
    ```

## Usage

1. Run the bot:

    ```bash
    node index.js
    ```

2. The bot will automatically start the faucet claiming process, retrying every 10 seconds if needed.

## Contributing

Feel free to open issues or submit pull requests if you have improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
