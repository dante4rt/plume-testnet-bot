# Plume Testnet Bot

## Description

Plume Testnet Bot is an application designed to interact with the Plume Network faucet on the testnet. It allows users to claim tokens (ETH) using their wallet address. The bot uses the Ethers.js library for Ethereum interactions and Axios for HTTP requests.

## Features

- Claim ETH tokens from the Plume testnet faucet.
- Automatically handles transactions and errors.
- Provides real-time feedback and transaction details.
- Includes a daily check-in feature for automated processes.

## Requirements

- Node.js
- `npm` or `yarn` for package management
- `.env` file for storing sensitive information
- `privateKeys.json` for daily check-ins

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

5. Create a `privateKeys.json` file in the root directory of the project. Add your private keys in the following format:

    ```json
    ["pk1", "pk2", "pk3"]
    ```

## Usage

### Running the Bot

1. Run the bot to claim ETH tokens:

    ```bash
    node index.js
    ```

2. The bot will automatically start the faucet claiming process, retrying every 10 seconds if needed.

### Daily Check-In

1. Run `daily.js` for automated daily check-ins:

    ```bash
    node daily.js
    ```

2. When prompted, choose:
    - `0` for a one-time check-in.
    - `1` to set up a cron job for automatic daily check-ins.

## Donations

If you would like to support the development of this project, you can make a donation using the following addresses:

- **Solana**: `GLQMG8j23ookY8Af1uLUg4CQzuQYhXcx56rkpZkyiJvP`
- **EVM**: `0x960EDa0D16f4D70df60629117ad6e5F1E13B8F44`
- **BTC**: `bc1p9za9ctgwwvc7amdng8gvrjpwhnhnwaxzj3nfv07szqwrsrudfh6qvvxrj8`

## Contributing

Feel free to open issues or submit pull requests if you have improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.