const axios = require('axios');
const moment = require('moment');
const {
  delay,
  displayHeader,
  logSuccess,
  logError,
} = require('../src/utils/utils');
const { createWallet, getAddress } = require('../src/utils/wallet');
const {
  provider,
  PRIVATE_KEY,
  CONTRACT_ADDRESS,
} = require('../src/utils/config');

(async () => {
  displayHeader();

  while (true) {
    try {
      console.log('Starting the faucet claiming process...'.yellow);

      const walletAddress = getAddress(PRIVATE_KEY, provider);
      console.log(`Using wallet address: ${walletAddress}`.yellow);
      console.log('Requesting tokens from the faucet...'.yellow);

      const { data } = await axios.post(
        'https://faucet.plumenetwork.xyz/api/faucet',
        {
          walletAddress,
          token: 'ETH',
        }
      );

      const { salt, signature } = data;

      const wallet = createWallet(PRIVATE_KEY, provider);
      const transactionData = `0x103fc4520000000000000000000000000000000000000000000000000000000000000060${salt.substring(
        2
      )}00000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000345544800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041${signature.substring(
        2
      )}00000000000000000000000000000000000000000000000000000000000000`;

      try {
        console.log('Preparing transaction...'.yellow);
        const nonce = await wallet.getNonce();
        const feeData = await wallet.provider.getFeeData();
        const gasLimit = await wallet.estimateGas({
          data: transactionData,
          to: CONTRACT_ADDRESS,
        });
        const gasPrice = feeData.gasPrice;

        const transaction = {
          data: transactionData,
          to: CONTRACT_ADDRESS,
          gasLimit,
          gasPrice,
          nonce,
          value: 0,
        };

        console.log('Sending transaction...'.yellow);
        const result = await wallet.sendTransaction(transaction);
        logSuccess(result.from, result.hash);
      } catch (error) {
        logError(error);
      }
    } catch (error) {
      console.log(
        `[${moment().format('HH:mm:ss')}] Critical error: ${error.message}`.red
      );
      break;
    }

    console.log('Retrying in 10 seconds...'.yellow);
    await delay(10000);
  }
})();
