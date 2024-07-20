require('dotenv').config();
require('colors');
const readlineSync = require('readline-sync');
const { default: axios } = require('axios');
const { JsonRpcProvider } = require('ethers');
const moment = require('moment');
const { displayHeader } = require('./src/display');
const {
  createWallet,
  getAddress,
  generateTransactionData,
} = require('./src/wallet');
const { PLUME_ABI } = require('./src/abi');
const { HEADERS } = require('./src/headers');

const RPC_URL = 'https://testnet-rpc.plumenetwork.xyz/http';
const provider = new JsonRpcProvider(RPC_URL);
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  displayHeader();

  const walletAddress = getAddress(PRIVATE_KEY, provider);
  console.log('Please wait...'.yellow);
  console.log(`Your address: ${walletAddress}`.yellow);
  console.log('');

  let tokenChoice = readlineSync.question(
    'Select token: 0 for ETH or 1 for GOON: '
  );

  while (tokenChoice !== '0' && tokenChoice !== '1') {
    console.log('Invalid input. Please enter 0 for ETH or 1 for GOON.'.red);
    tokenChoice = readlineSync.question(
      'Select token: 0 for ETH or 1 for GOON: '
    );
  }

  const token = tokenChoice === '0' ? 'ETH' : 'GOON';
  console.log('');

  while (true) {
    try {
      console.log('Requesting tokens from the faucet...'.yellow);

      const { data } = await axios({
        url: 'https://faucet.plumenetwork.xyz/api/faucet',
        method: 'POST',
        data: {
          walletAddress,
          token,
        },
        headers: HEADERS,
      });

      console.log('Received faucet response.'.yellow);

      const salt = data.salt;
      const signature = data.signature;

      const wallet = createWallet(PRIVATE_KEY, provider);
      const transactionData = generateTransactionData(salt, signature);

      try {
        console.log('Preparing transaction...'.yellow);
        const nonce = await wallet.getNonce();
        const feeData = await wallet.provider.getFeeData();
        const gasLimit = await wallet.estimateGas({
          data: transactionData,
          to: PLUME_ABI.at(-1).CA,
        });
        const gasPrice = feeData.gasPrice;

        const transaction = {
          data: transactionData,
          to: PLUME_ABI.at(-1).CA,
          gasLimit: gasLimit,
          gasPrice: gasPrice,
          nonce: nonce,
          value: 0,
        };

        console.log('Sending transaction...'.yellow);
        const result = await wallet.sendTransaction(transaction);
        console.log(
          `[${moment().format('HH:mm:ss')}] Claim to ${
            result.from
          } was successful!`.green
        );
        console.log(
          `[${moment().format(
            'HH:mm:ss'
          )}] Transaction hash: https://testnet-explorer.plumenetwork.xyz/tx/${
            result.hash
          }`.green
        );
        console.log('');
        break;
      } catch (error) {
        if (error.shortMessage) {
          if (error.shortMessage.includes('Signature is already used')) {
            console.log(
              `[${moment().format(
                'HH:mm:ss'
              )}] You can only claim faucet every 10 minutes, please try again later.`
                .red
            );
          } else if (
            error.shortMessage ===
            'execution reverted: "Invalid admin signature"'
          ) {
            console.log(
              `[${moment().format(
                'HH:mm:ss'
              )}] Your IP has been rate-limited by Plume. Please wait 10-30 minutes.`
                .red
            );
          } else {
            console.log(
              `[${moment().format('HH:mm:ss')}] Error: ${error.shortMessage}`
                .red
            );
          }
        } else if (error.error && error.error.message) {
          console.log(
            `[${moment().format('HH:mm:ss')}] Error: ${error.error.message}`.red
          );
        } else {
          console.log(
            `[${moment().format(
              'HH:mm:ss'
            )}] Error while doing the transaction: ${error}`.red
          );
        }
      }
    } catch (error) {
      if (error.message.includes('524')) {
        console.log('Error: Request timeout'.red);
      } else {
        console.log(
          `[${moment().format('HH:mm:ss')}] Error: ${error.message}`.red
        );
        break;
      }
    }

    console.log('Retrying in 10 seconds...'.yellow);
    await delay(10000);
  }
})();
