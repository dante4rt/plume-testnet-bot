require('dotenv').config();
require('colors');
const readlineSync = require('readline-sync');
const { CronJob } = require('cron');
const { execSync } = require('child_process');
const moment = require('moment');

const { SWAP_ABI } = require('./src/swapAbi');
const { Wallet, Contract } = require('ethers');
const { provider } = require('./src/config');
const { displayHeader, delay } = require('./src/utils');

const CONTRACT_ADDRESS = SWAP_ABI.at(-1).contractAddress;
const BASE_TOKEN = SWAP_ABI.at(-1).baseCoin;
const QUOTE_TOKEN = SWAP_ABI.at(-1).quoteCoin;
const POOL_INDEX = SWAP_ABI.at(-1).poolIndex;
const IS_BUY_ORDER = SWAP_ABI.at(-1).isBuyOrder;
const IS_BASE_QUANTITY = SWAP_ABI.at(-1).isBaseQuantity;
const TRADE_QUANTITY = SWAP_ABI.at(-1).tradeQuantity;
const TRADE_TIP = SWAP_ABI.at(-1).tradeTip;
const LIMIT_ORDER_PRICE = SWAP_ABI.at(-1).limitOrderPrice;
const MINIMUM_OUTPUT = SWAP_ABI.at(-1).minimumOutput;
const RESERVE_FLAGS = SWAP_ABI.at(-1).reserveFlags;

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const txCountInput = readlineSync.question(
  'How many transactions do you want? (default is 1): '
);
let transactionCount = txCountInput ? parseInt(txCountInput, 10) : 1;

const autoRunInput = readlineSync.question(
  'Do you want to auto run this script every 24 hours? (Y/N): '
);
const autoRun = autoRunInput.toLowerCase() === 'y';

const performTransactions = async (count) => {
  displayHeader();
  console.log(`[${moment().format('HH:mm:ss')}] Please wait...`.yellow);
  console.log('');

  while (count > 0) {
    try {
      const wallet = new Wallet(PRIVATE_KEY, provider);
      const contract = new Contract(CONTRACT_ADDRESS, SWAP_ABI, wallet);

      const transactionResponse = await contract.swap(
        BASE_TOKEN,
        QUOTE_TOKEN,
        POOL_INDEX,
        IS_BUY_ORDER,
        IS_BASE_QUANTITY,
        TRADE_QUANTITY,
        TRADE_TIP,
        LIMIT_ORDER_PRICE,
        MINIMUM_OUTPUT,
        RESERVE_FLAGS
      );

      console.log(
        `[${moment().format(
          'HH:mm:ss'
        )}] Successfully swapped 0.001 $GOON to 0.999 $goonUSD from ${
          transactionResponse.from
        }!`.green
      );
      console.log(
        `[${moment().format(
          'HH:mm:ss'
        )}] Transaction hash: https://testnet-explorer.plumenetwork.xyz/tx/${
          transactionResponse.hash
        }`.green
      );

      if (count !== 0) {
        await delay(10000);
      }
    } catch (error) {
      console.log(
        `[${moment().format(
          'HH:mm:ss'
        )}] Insufficient $GOON. Please claim from the faucet first. Error details: ${
          error.message
        }`.red
      );
    }
    count--;

    if (count === 0) {
      console.log('');
      console.log(
        `[${moment().format(
          'HH:mm:ss'
        )}] All transactions have been completed. Congrats! Subscribe: https://t.me/HappyCuanAirdrop`
          .blue
      );
    }
  }
};

(async () => {
  await performTransactions(transactionCount);

  if (autoRun) {
    const cronCommand = `node ${__filename} ${transactionCount}`;
    const cronSchedule = '0 0 * * *';
    const timeZone = 'Asia/Jakarta';

    new CronJob(
      cronSchedule,
      () => {
        execSync(cronCommand, { stdio: 'inherit' });
      },
      null,
      true,
      timeZone
    );

    console.log(
      `[${moment().format(
        'HH:mm:ss'
      )}] Cron job scheduled to run every 24 hours at midnight (Asia/Jakarta).`
        .yellow
    );
  }
})();
