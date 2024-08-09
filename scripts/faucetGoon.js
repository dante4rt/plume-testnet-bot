require('colors');
const { ethers } = require('ethers');
const { PRIVATE_KEY, provider } = require('../src/utils/config');
const { default: axios } = require('axios');
const moment = require('moment');

const { GOON_ABI } = require('../src/ABI/goonAbi');
const { displayHeader, delay } = require('../src/utils/utils');
const { PLUME_ABI } = require('../src/ABI/abi');

const IMPLEMENTATION_CA = PLUME_ABI.at(-1).IMPLEMENTATION_CA;
const PROXY_CA = PLUME_ABI.at(-1).CA;

async function getData(wallet) {
  try {
    console.log(
      `[${moment().format('HH:mm:ss')}] Requesting faucet data for wallet: ${
        wallet.address
      }...`.blue
    );

    const { data } = await axios({
      url: 'https://faucet.plumenetwork.xyz/api/faucet',
      method: 'POST',
      data: {
        walletAddress: wallet.address,
        token: 'GOON',
      },
    });

    console.log(
      `[${moment().format('HH:mm:ss')}] Successfully retrieved data: salt = ${
        data.salt
      }, signature = ${data.signature}`.green
    );

    return { salt: data.salt, signature: data.signature, token: data.token };
  } catch (error) {
    console.error(
      `[${moment().format(
        'HH:mm:ss'
      )}] Error occurred while fetching faucet data: ${error.message}`.red
    );
    throw error;
  }
}

async function claimFaucet(wallet, token, salt, signature) {
  try {
    console.log(
      `[${moment().format(
        'HH:mm:ss'
      )}] Preparing to claim faucet using token: ${token}, salt: ${salt}, and signature: ${signature}...`
        .blue
    );

    const implementationContract = new ethers.Contract(
      IMPLEMENTATION_CA,
      GOON_ABI,
      wallet
    );
    const data = implementationContract.interface.encodeFunctionData(
      'getToken',
      [token, salt, signature]
    );

    const transaction = {
      to: PROXY_CA,
      data,
      from: wallet.address,
    };

    const txResponse = await wallet.sendTransaction(transaction);
    console.log(
      `[${moment().format('HH:mm:ss')}] Transaction successfully sent. Hash: ${
        txResponse.hash
      }`.green
    );

    return txResponse;
  } catch (error) {
    console.error(
      `[${moment().format('HH:mm:ss')}] Error occurred while claiming faucet: ${
        error.reason || error.message
      }`.red
    );
    throw error;
  }
}

(async () => {
  displayHeader();

  while (true) {
    try {
      console.log(
        `[${moment().format(
          'HH:mm:ss'
        )}] Initializing wallet with provided private key...`.blue
      );
      const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

      console.log(
        `[${moment().format('HH:mm:ss')}] Fetching faucet data...`.blue
      );
      const { salt, signature, token } = await getData(wallet);

      console.log(
        `[${moment().format(
          'HH:mm:ss'
        )}] Attempting to claim faucet for wallet: ${wallet.address}...`.blue
      );
      const response = await claimFaucet(wallet, token, salt, signature);

      console.log(
        `[${moment().format(
          'HH:mm:ss'
        )}] Successfully claimed token for wallet: ${wallet.address}`.green
      );
      console.log(
        `[${moment().format(
          'HH:mm:ss'
        )}] Transaction details: https://testnet-explorer.plumenetwork.xyz/tx/${
          response.hash
        }`.green
      );
    } catch (error) {
      console.error(
        `[${moment().format('HH:mm:ss')}] Error: ${error.message}`.red
      );
    }
    console.log(
      `[${moment().format('HH:mm:ss')}] Retrying in 10 seconds...`.yellow
    );
    await delay(10000);
  }
})();
