const readlineSync = require('readline-sync');
const colors = require('colors');
const { ethers } = require('ethers');
const moment = require('moment');
const fs = require('fs');
const cron = require('cron');

const { provider } = require('../src/utils/config');
const { PREDICT_ABI } = require('../src/ABI/predictAbi');
const { PREDICT_PAIR, PREDICT_CONTRACT } = require('../src/utils/pairIndex');
const { displayHeader, filterPairsByType } = require('../src/utils/utils');

const IMPLEMENTATION_CA = PREDICT_CONTRACT.implementation;
const PARENT_CA = PREDICT_CONTRACT.proxy;

const privateKeys = JSON.parse(fs.readFileSync('privateKeys.json', 'utf-8'));

const runPredictionForAllWallets = async (selectedPair, isLong) => {
  for (const privateKey of privateKeys) {
    try {
      const wallet = new ethers.Wallet(privateKey, provider);
      const implementationCa = new ethers.Contract(
        IMPLEMENTATION_CA,
        PREDICT_ABI,
        wallet
      );

      const data = implementationCa.interface.encodeFunctionData(
        'predictPriceMovement',
        [selectedPair.index.toString(), isLong]
      );

      const transaction = {
        to: PARENT_CA,
        data,
        from: wallet.address,
      };

      console.log(
        colors.yellow(`Sending transaction from wallet: ${wallet.address}...`)
      );
      const txResponse = await wallet.sendTransaction(transaction);
      await txResponse.wait();

      console.log(
        colors.green(
          `[${moment().format(
            'HH:mm:ss'
          )}] Transaction successful from wallet: ${wallet.address}`
        )
      );
      console.log(
        colors.magenta(
          `[${moment().format(
            'HH:mm:ss'
          )}] Transaction Hash: https://testnet-explorer.plumenetwork.xyz/tx/${
            txResponse.hash
          }`
        )
      );
    } catch (error) {
      if (error.message.includes('Wait for cooldown')) {
        console.log(
          colors.red(
            `[${moment().format(
              'HH:mm:ss'
            )}] You already predicted that, please wait for the cooldown (1 hour).`
          )
        );
      } else if (error.message.includes('Pair has not started yet')) {
        console.log(
          colors.red(
            `[${moment().format(
              'HH:mm:ss'
            )}] Pair is not available yet, try another pair.`
          )
        );
      } else {
        console.log(
          colors.red(
            `[${moment().format(
              'HH:mm:ss'
            )}] Error with wallet ${privateKey}: ${error.message}`
          )
        );
      }
    }
  }
};

const predictForAllPairs = async (type, isLong) => {
  const availablePairs = filterPairsByType(type, PREDICT_PAIR);

  for (const pair of availablePairs) {
    console.log(
      colors.green(
        `[${moment().format('HH:mm:ss')}] Predicting for pair: ${pair.name} (${
          pair.symbol
        })`
      )
    );
    await runPredictionForAllWallets(pair, isLong);
  }
};

const main = async () => {
  displayHeader();
  console.log(`Please wait...`.yellow);
  console.log('');

  try {
    const predictionType = readlineSync.question(
      colors.yellow(
        'What do you want to predict?\n1. Crypto\n2. Forex\nSelect (1 or 2): '
      )
    );

    const type = predictionType === '1' ? 'crypto' : 'forex';

    const choice = readlineSync.question(
      colors.yellow(
        'Do you want to predict:\n1. One specific pair\n2. All available pairs\nSelect (1 or 2): '
      )
    );

    if (choice === '1') {
      const availablePairs = filterPairsByType(type, PREDICT_PAIR);
      const pairNames = availablePairs.map(
        (pair, index) => `${index + 1}. ${pair.name} (${pair.symbol})`
      );
      const pairIndex = readlineSync.keyInSelect(
        pairNames,
        colors.cyan('Choose a pair: ')
      );

      if (pairIndex === -1) {
        console.log(
          colors.red(
            `[${moment().format('HH:mm:ss')}] No pair selected. Exiting...`
          )
        );
        return;
      }

      const selectedPair = availablePairs[pairIndex];
      console.log(
        colors.green(
          `[${moment().format('HH:mm:ss')}] You selected: ${
            selectedPair.name
          } (${selectedPair.symbol})`
        )
      );

      let longOrShort;
      while (!longOrShort) {
        const input = readlineSync
          .question(
            colors.yellow(
              'Do you want to go Long or Short? (Type "long" or "short"): '
            )
          )
          .toLowerCase();

        if (input === 'long' || input === 'short') {
          longOrShort = input;
        } else {
          console.log(
            colors.red('Invalid input, please type "long" or "short".')
          );
        }
      }
      const isLong = longOrShort === 'long';

      const runEveryHour = readlineSync.keyInYN(
        colors.yellow('Do you want to run this prediction every 1 hour?')
      );

      if (runEveryHour) {
        await runPredictionForAllWallets(selectedPair, isLong);
        console.log('');

        const job = new cron.CronJob('0 * * * *', () => {
          runPredictionForAllWallets(selectedPair, isLong);
        });
        job.start();
        console.log(
          colors.green(
            `[${moment().format(
              'HH:mm:ss'
            )}] Cron job started: Prediction will run every 1 hour.`
          )
        );
      } else {
        await runPredictionForAllWallets(selectedPair, isLong);
      }
    } else if (choice === '2') {
      let longOrShort;
      while (!longOrShort) {
        const input = readlineSync
          .question(
            colors.yellow(
              'Do you want to go Long or Short? (Type "long" or "short"): '
            )
          )
          .toLowerCase();

        if (input === 'long' || input === 'short') {
          longOrShort = input;
        } else {
          console.log(
            colors.red('Invalid input, please type "long" or "short".')
          );
        }
      }
      const isLong = longOrShort === 'long';

      const runEveryHour = readlineSync.keyInYN(
        colors.yellow(
          'Do you want to run predictions every 1 hour for all pairs?'
        )
      );

      if (runEveryHour) {
        await predictForAllPairs(type, isLong);

        const job = new cron.CronJob('0 * * * *', () => {
          predictForAllPairs(type, isLong);
        });
        job.start();
        console.log(
          colors.green(
            `[${moment().format(
              'HH:mm:ss'
            )}] Cron job started: Predictions will run every 1 hour for all pairs.`
          )
        );
      } else {
        await predictForAllPairs(type, isLong);
      }
    } else {
      console.log(colors.red('Invalid choice, exiting...'));
    }
  } catch (error) {
    console.log(
      colors.red(`[${moment().format('HH:mm:ss')}] Error: ${error.message}`)
    );
  } finally {
    console.log('');
    console.log(
      colors.green(`[${moment().format('HH:mm:ss')}] All tasks done!`)
    );
    console.log(
      colors.green(
        `[${moment().format(
          'HH:mm:ss'
        )}] Subscribe: https://t.me/HappyCuanAirdrop`
      )
    );
  }
};

main();
