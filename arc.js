require('colors');
const moment = require('moment');
const fs = require('fs');
const { ethers } = require('ethers');
const readlineSync = require('readline-sync');
const { CronJob } = require('cron');

const { provider } = require('./src/config');
const { ARC_ABI, ARC_UTILS } = require('./src/arcAbi');
const { displayHeader } = require('./src/utils');

const PROXY_CONTRACT_ADDRESS = ARC_UTILS.PROXY_CA;
const IMPLEMENTATION_CONTRACT_ADDRESS = ARC_UTILS.IMPLEMENTATION_CA;
const RWA_IMAGES = ARC_UTILS.IMAGES;

const PRIVATE_KEYS = JSON.parse(fs.readFileSync('privateKeys.json', 'utf-8'));

function generateRandomString(length) {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
}

async function createRwaToken(privateKey) {
  const wallet = new ethers.Wallet(privateKey, provider);

  const name = generateRandomString(Math.floor(Math.random() * 6) + 5);
  const symbol = 'ITEM';
  const description = generateRandomString(Math.floor(Math.random() * 6) + 5);
  const rwaType = Math.floor(Math.random() * 10);
  const image = RWA_IMAGES[rwaType];

  const implementationContract = new ethers.Contract(
    IMPLEMENTATION_CONTRACT_ADDRESS,
    ARC_ABI,
    wallet
  );

  const data = implementationContract.interface.encodeFunctionData(
    'createToken',
    [name, symbol, description, rwaType, image]
  );

  const nonce = await provider.getTransactionCount(wallet.address);
  const feeData = await wallet.provider.getFeeData();
  const gasPrice = feeData.gasPrice;

  const gasLimit = await wallet.estimateGas({
    data: data,
    to: PROXY_CONTRACT_ADDRESS,
  });

  const transaction = {
    to: PROXY_CONTRACT_ADDRESS,
    data: data,
    gasPrice: gasPrice,
    gasLimit: gasLimit,
    nonce: nonce,
    from: wallet.address,
  };

  const txHash = await wallet.sendTransaction(transaction);

  return txHash;
}

async function runFactoryNFT() {
  displayHeader();
  for (const PRIVATE_KEY of PRIVATE_KEYS) {
    try {
      const receipt = await createRwaToken(PRIVATE_KEY);
      console.log(
        `[${moment().format('HH:mm:ss')}] Mint NFT for wallet ${
          receipt.from
        } has been successful! 🌟`.green
      );
      console.log(
        `[${moment().format(
          'HH:mm:ss'
        )}] Transaction hash: https://testnet-explorer.plumenetwork.xyz/tx/${
          receipt.hash
        }`.green
      );
      console.log('');
    } catch (error) {
      console.error(
        `[${moment().format('HH:mm:ss')}] Error creating token: ${error}`.red
      );
    }
  }
}

const userChoice = readlineSync.question(
  'Would you like to run the check-in:\n0: One-time run\n1: Automate with cron (every 24 hours)\nChoose 0 or 1: '
);

if (userChoice === '0') {
  runFactoryNFT();
} else if (userChoice === '1') {
  runFactoryNFT()
    .then(() => {
      const job = new CronJob(
        '0 0 * * *',
        runFactoryNFT,
        null,
        true,
        'Asia/Jakarta'
      );
      job.start();
      console.log(
        'Cron job started! The check-in will run every 24 hours. 🕒'.cyan
      );
    })
    .catch((error) => {
      console.log(
        `[${moment().format(
          'HH:mm:ss'
        )}] Error running check-in before setting up cron: ${error}`.red
      );
    });
} else {
  console.log(
    'Invalid choice! Please run the script again and choose either 0 or 1.'.red
  );
}
