const { Contract, parseEther } = require('ethers');
const fs = require('fs');
const moment = require('moment');
const readlineSync = require('readline-sync');
const { CronJob } = require('cron');

const { provider } = require('../src/utils/config');
const { STAKE_ABI, STAKE_UTILS } = require('../src/ABI/stakeAbi');
const { displayHeader } = require('../src/utils/utils');
const { createWallet } = require('../src/utils/wallet');
const { ERC20_ABI } = require('../src/ABI/ercAbi');

const IMPLEMENTATION_CA = STAKE_UTILS.implementationContractAddress;
const CA = STAKE_UTILS.contractAddress;
const GOON_CA = STAKE_UTILS.goonCA;

const PRIVATE_KEYS = JSON.parse(fs.readFileSync('privateKeys.json', 'utf-8'));

async function doStake(privateKey) {
  const retryDelay = 5000;

  while (true) {
    try {
      const wallet = createWallet(privateKey, provider);
      const implementationContract = new Contract(
        IMPLEMENTATION_CA,
        STAKE_ABI,
        wallet
      );

      const goonContract = new Contract(GOON_CA, ERC20_ABI, wallet);
      await goonContract.approve(CA, parseEther('1'));

      const data = implementationContract.interface.encodeFunctionData(
        'stake',
        [parseEther('0.1')]
      );

      const feeData = await wallet.provider.getFeeData();
      const gasPrice = feeData.gasPrice;

      const gasLimit = await wallet.estimateGas({
        data,
        to: CA,
      });

      const transaction = {
        to: CA,
        data,
        gasLimit,
        gasPrice,
        from: wallet.address,
      };

      const txHash = await wallet.sendTransaction(transaction);
      return txHash;
    } catch (error) {
      console.log(
        `[${moment().format('HH:mm:ss')}] Error executing transaction: ${
          error.message
        }`.red
      );
      console.log(
        `[${moment().format('HH:mm:ss')}] Retrying transaction in ${
          retryDelay / 1000
        } seconds...`.yellow
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}

async function runStakeGoon() {
  displayHeader();
  console.log('Preparing to stake...'.yellow);

  for (const PRIVATE_KEY of PRIVATE_KEYS) {
    try {
      const receipt = await doStake(PRIVATE_KEY);
      if (receipt.from) {
        console.log(
          `[${moment().format(
            'HH:mm:ss'
          )}] Successfully staked 0.1 $GOONUSD for wallet ${receipt.from}! 🌟`
            .green
        );
        console.log(
          `[${moment().format(
            'HH:mm:ss'
          )}] Transaction hash: https://testnet-explorer.plumenetwork.xyz/tx/${
            receipt.hash
          }`.green
        );
        console.log('');
      }
    } catch (error) {
      console.log(
        `[${moment().format(
          'HH:mm:ss'
        )}] Error processing transaction. Please try again later.`.red
      );
    }
  }

  console.log(
    `[${moment().format(
      'HH:mm:ss'
    )}] All staking transactions completed. Congratulations! Subscribe: https://t.me/HappyCuanAirdrop`
      .blue
  );
}

const userChoice = readlineSync.question(
  'Would you like to run the staking process:\n0: One-time run\n1: Automate with cron (every 24 hours)\nChoose 0 or 1: '
);

if (userChoice === '0') {
  runStakeGoon();
} else if (userChoice === '1') {
  runStakeGoon()
    .then(() => {
      const job = new CronJob(
        '0 0 * * *',
        runStakeGoon,
        null,
        true,
        'Asia/Jakarta'
      );
      job.start();
      console.log(
        'Cron job started! The staking process will run every 24 hours. 🕒'.cyan
      );
    })
    .catch((error) => {
      console.log(
        `[${moment().format('HH:mm:ss')}] Error setting up cron job: ${
          error.message
        }`.red
      );
    });
} else {
  console.log(
    'Invalid choice! Please run the script again and select either 0 or 1.'.red
  );
}
