/* eslint-disable global-require */

const Web3 = require('web3'); // required for Open Zeppelin GSN provider
const { GSNProvider } = require('@openzeppelin/gsn-provider');
const deploymentData = require('src/../../.openzeppelin/mainnet.json');

const abi = {
  logic: require('src/../../build/contracts/ProvideLiquidity.json').abi,
  factory: require('src/../../build/contracts/ProvideLiquidityFactory.json').abi,
};

const addresses = {
  logic: deploymentData.proxies['bancor-fiat-on-ramp/ProvideLiquidity'][0].address,
  factory: deploymentData.proxies['bancor-fiat-on-ramp/ProvideLiquidityFactory'][0].address,
};

export async function setEthereumData({ commit }, signer) {
  // Get user's address
  const userAddress = await signer.getAddress();
  commit('setWallet', { signer, userAddress });

  // Create GSN provider
  const web3gsn = new Web3(new GSNProvider(signer.provider));

  // Get contract instances to check their status
  const contracts = {
    Logic: new web3gsn.eth.Contract(abi.logic, addresses.logic),
    Factory: new web3gsn.eth.Contract(abi.factory, addresses.factory),
  };
  commit('setContracts', contracts);
}
