<template>
  <q-btn
    label="Connect Wallet to Get Started"
    color="primary"
    :loading="isLoading"
    @click="connectWallet()"
  />
</template>

<script>
import { mapState } from 'vuex';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Portis from '@portis/web3';
import Fortmatic from 'fortmatic';
import Squarelink from 'squarelink';
import Torus from '@toruslabs/torus-embed';
import Arkane from '@arkane-network/web3-arkane-provider';
import Authereum from 'authereum';
import BurnerConnectProvider from '@burner-wallet/burner-connect-provider';

const addresses = require('src/addresses.json');
const abi = require('src/abi/ESRedemption.json');

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: process.env.INFURA_ID,
    },
  },
  portis: {
    package: Portis,
    options: {
      id: process.env.PORTIS_ID,
    },
  },
  fortmatic: {
    package: Fortmatic,
    options: {
      key: process.env.FORTMATIC_KEY,
    },
  },
  squarelink: {
    package: Squarelink,
    options: {
      id: process.env.SQUARELINK_ID,
    },
  },
  torus: {
    package: Torus, // required
    options: {},
  },
  arkane: {
    package: Arkane, // required
    options: {
      clientId: process.env.ARKANE_CLIENT_ID,
    },
  },
  authereum: {
    package: Authereum, // required
    options: {},
  },
  burnerconnect: {
    package: BurnerConnectProvider, // required
    options: {},
  },
};

const web3Modal = new Web3Modal({
  network: 'mainnet',
  cacheProvider: false, // always require suer to choose provider
  providerOptions,
});

export default {
  name: 'ConnectWallet',

  data() {
    return {
      ESRedemption: undefined, // contract instance for user
      isLoading: false,
    };
  },

  computed: {
    ...mapState({
      signer: (state) => state.main.signer,
      userAddress: (state) => state.main.userAddress,
    }),
  },

  methods: {
    async connectWallet() {
      this.isLoading = true;
      // Prompt user to connect wallet of their choice
      const web3provider = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(web3provider);
      const signer = provider.getSigner();
      await this.$store.dispatch('main/setWallet', signer);
      // Now we have a contract instance to use for sending transactions from
      // the selected wallet
      this.ESRedemption = new ethers.Contract(addresses.ESRedemption, abi, signer);
      this.isLoading = false;
    },
  },
};
</script>
