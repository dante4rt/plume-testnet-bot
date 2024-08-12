# Plume Testnet Bot

## Description

Plume Testnet Bot is an application designed to interact with the Plume Network faucet on the testnet. It allows users to claim tokens (ETH) using their wallet address. The bot uses the Ethers.js library for Ethereum interactions and Axios for HTTP requests.

## Features

- Claim ETH and GOON tokens from the Plume testnet faucet.
- Automatically handles transactions and errors.
- Provides real-time feedback and transaction details.
- Includes a daily check-in, auto mint NFT, auto stake, and auto swap feature for automated processes.

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

    ```env
    PRIVATE_KEY=your_private_key_here
    ```

5. Create a `privateKeys.json` file in the root directory of the project. Add your private keys in the following format:

    ```json
    ["pk1", "pk2", "pk3"]
    ```

## Usage

### Running the Menu

1. Run the menu to choose which script to execute:

    ```bash
    node index.js
    ```

2. The menu will prompt you to select a script to run. Choose the desired option and follow the instructions to run the corresponding npm script.

### Script Commands

1. **Claim ETH Faucet Daily:**

    ```bash
    npm run faucet
    ```

2. **Auto Swap:**

    ```bash
    npm run swap
    ```

3. **Auto Stake 0.1 goonUSD:**

    ```bash
    npm run stake
    ```

4. **Auto Daily Check-In:**

    ```bash
    npm run daily
    ```

5. **Auto Mint NFT:**

    ```bash
    npm run mint
    ```

6. **Claim GOON Faucet Daily:**

    ```bash
    npm run goon
    ```

7. **Auto Predict:**

    ```bash
    npm run predict
    ```

### Setting Up Cron Jobs

For each script, you can set up cron jobs manually to run them at desired intervals. For example, to run the `faucet` script daily:

1. Open your crontab:

    ```bash
    crontab -e
    ```

2. Add a line to schedule the `faucet` script to run daily at midnight:

    ```bash
    0 0 * * * cd /path/to/plume-testnet-bot && npm run faucet
    ```

Replace `/path/to/plume-testnet-bot` with the actual path to the directory.

## Donations

If you would like to support the development of this project, you can make a donation using the following addresses:

- **Solana**: `GLQMG8j23ookY8Af1uLUg4CQzuQYhXcx56rkpZkyiJvP`
- **EVM**: `0x960EDa0D16f4D70df60629117ad6e5F1E13B8F44`
- **BTC**: `bc1p9za9ctgwwvc7amdng8gvrjpwhnhnwaxzj3nfv07szqwrsrudfh6qvvxrj8`

## Contributing

Feel free to open issues or submit pull requests if you have improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
