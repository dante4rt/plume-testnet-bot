const { Wallet } = require('ethers');

function createWallet(privateKey, provider) {
  return new Wallet(privateKey, provider);
}

function getAddress(privateKey, provider) {
  return new Wallet(privateKey, provider).address;
}

module.exports = { createWallet, getAddress };
