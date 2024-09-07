require('dotenv').config();
require('colors');

const { CronJob } = require('cron');
const fs = require('fs');
const moment = require('moment');
const readlineSync = require('readline-sync');

const { Wallet } = require('ethers');
const { provider } = require('../src/utils/config');
const { CHECKIN_ABI } = require('../src/ABI/checkinAbi');
const { displayHeader } = require('../src/utils/utils');

const CONTRACT = CHECKIN_ABI.at(-1).CA;
const PRIVATE_KEYS = JSON.parse(fs.readFileSync('privateKeys.json', 'utf-8'));

const MAX_ATTEMPTS = 10;
const walletsCheckedIn = new Set();

async function checkDailyStreak(wallet) {
  let attemptCount = 0;

  while (attemptCount < MAX_ATTEMPTS) {
    try {
      if (walletsCheckedIn.has(wallet.address)) {
        console.log(
          `[${moment().format('HH:mm:ss')}] Wallet ${wallet.address} has already checked in. Skipping...`.yellow
        );
        return;
      }

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
          `[${moment().format('HH:mm:ss')}] Transaction hash: https://testnet-explorer.plumenetwork.xyz/tx/${
            result.hash
          }`.green
        );
        console.log('');
        walletsCheckedIn.add(wallet.address); 
        return; 
      }
    } catch (error) {
      console.log(
        `[${moment().format('HH:mm:ss')}] Wallet ${
          wallet.address
        } check-in failed. Retrying (${attemptCount + 1})... 🚫`.red
      );
      console.log('');
      attemptCount++;
      await new Promise((resolve) => setTimeout(resolve, 10000)); 
    }
  }

  console.log(
    `[${moment().format('HH:mm:ss')}] Wallet ${
      wallet.address
    } failed after ${MAX_ATTEMPTS} attempts. Moving to the next wallet. ❌`.red
  );
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
  async function scheduleCheckIn() {
    await runCheckIn();
    const waitTime = 24 * 60 * 60 * 1000 + 5 * 60 * 1000;
    setTimeout(scheduleCheckIn, waitTime);
  }

  scheduleCheckIn()
    .then(() => {
      console.log(
        'Check-in scheduling started! The check-in will run every 24 hours and 5 minutes. 🕒'
          .cyan
      );
    })
    .catch((error) => {
      console.log(
        `[${moment().format('HH:mm:ss')}] Error running check-in before scheduling: ${error}`.red
      );
    });
} else {
  console.log(
    'Invalid choice! Please run the script again and choose either 0 or 1.'.red
  );
}
