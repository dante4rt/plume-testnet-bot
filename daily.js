require('dotenv').config();
require('colors');

const { CronJob } = require('cron');
const fs = require('fs');
const moment = require('moment');
const readlineSync = require('readline-sync');

const { Wallet } = require('ethers');
const { provider } = require('./src/config');
const { CHECKIN_ABI } = require('./src/checkinAbi');
const { displayHeader } = require('./src/utils');

const CONTRACT = CHECKIN_ABI.at(-1).CA;
const PRIVATE_KEYS = JSON.parse(fs.readFileSync('privateKeys.json', 'utf-8'));

async function checkDailyStreak(wallet) {
  try {
    const feeData = await wallet.provider.getFeeData();
    const nonce = await provider.getTransactionCount(wallet.address);
    const gasFee = feeData.gasPrice;
    const gasLimit = await wallet.estimateGas({
      data: CHECKIN_ABI.at(-1).data,
      to: CONTRACT,
    });
    const tx = {
      to: CONTRACT,
      from: wallet.address,
      nonce,
      data: CHECKIN_ABI.at(-1).data,
      gas: gasLimit,
      gasPrice: gasFee,
    };

    const result = await wallet.sendTransaction(tx);
    if (result.hash) {
      console.log(
        `[${moment().format('HH:mm:ss')}] Daily check-in for wallet ${
          wallet.address
        } has been successful! 🌟`.green
      );
      console.log(
        `[${moment().format(
          'HH:mm:ss'
        )}] Transaction hash: https://testnet-explorer.plumenetwork.xyz/tx/${
          result.hash
        }`.green
      );
      console.log('');
    }
  } catch (error) {
    console.log(
      `[${moment().format('HH:mm:ss')}] Your address (${
        wallet.address
      }) already did your daily check-in. Try again in 24 hours. 🚫`.red
    );
    console.log('');
  }
}

async function runCheckIn() {
  displayHeader();
  console.log('');
  for (const privateKey of PRIVATE_KEYS) {
    try {
      const wallet = new Wallet(privateKey, provider);
      await checkDailyStreak(wallet);
    } catch (error) {
      console.log(`[${moment().format('HH:mm:ss')}] Error: ${error}`.red);
    }
  }
}

const userChoice = readlineSync.question(
  'Would you like to run the check-in:\n0: One-time run\n1: Automate with cron (every 24 hours)\nChoose 0 or 1: '
);

if (userChoice === '0') {
  runCheckIn();
} else if (userChoice === '1') {
  runCheckIn()
    .then(() => {
      const job = new CronJob(
        '0 0 * * *',
        runCheckIn,
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
