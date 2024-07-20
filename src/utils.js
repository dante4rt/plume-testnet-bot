require('colors');
const moment = require('moment');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function displayHeader() {
  process.stdout.write('\x1Bc');
  console.log('========================================'.cyan);
  console.log('=       Plume Faucet Claimer Bot       ='.cyan);
  console.log('=     Created by HappyCuanAirdrop      ='.cyan);
  console.log('=    https://t.me/HappyCuanAirdrop     ='.cyan);
  console.log('========================================'.cyan);
  console.log();
}

function logSuccess(from, hash) {
  console.log(
    `[${moment().format('HH:mm:ss')}] Claim to ${from} was successful!`.green
  );
  console.log(
    `[${moment().format(
      'HH:mm:ss'
    )}] Transaction hash: https://testnet-explorer.plumenetwork.xyz/tx/${hash}`
      .green
  );
  console.log('');
}

function logError(error) {
  if (error.shortMessage) {
    if (error.shortMessage.includes('Signature is already used')) {
      console.log(
        `[${moment().format(
          'HH:mm:ss'
        )}] You can only claim from the faucet every 1 hour. Please try again later.`
          .red
      );
    } else if (error.shortMessage.includes('could not coalesce error')) {
      console.log(
        `[${moment().format('HH:mm:ss')}] RPC is down. Please try again later.`
          .red
      );
    } else {
      console.log(
        `[${moment().format('HH:mm:ss')}] Transaction error: ${
          error.shortMessage
        }`.red
      );
    }
  } else if (error.error && error.error.message) {
    console.log(
      `[${moment().format('HH:mm:ss')}] Transaction error: ${
        error.error.message
      }`.red
    );
  } else {
    console.log(
      `[${moment().format('HH:mm:ss')}] Unexpected transaction error: ${error}`
        .red
    );
  }
}

module.exports = { delay, displayHeader, logSuccess, logError };
