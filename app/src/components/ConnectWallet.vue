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
import Onboard from 'bnc-onboard';

let provider;
const walletOptions = {
  // ..... options here
};

export default {
  name: 'ConnectWallet',

  data() {
    return {
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
      try {
        this.isLoading = true;
        // Prompt user to connect wallet of their choice
        const onboard = Onboard({
          ...walletOptions,
          dappId: process.env.BLOCKNATIVE_API_KEY, // [String] The API key created by step one above
          networkId: 1, // [Integer] The Ethereum network ID your Dapp uses.
          darkMode: Boolean(this.$q.localStorage.getItem('isDark')),
          subscriptions: {
            wallet: (wallet) => {
              provider = new ethers.providers.Web3Provider(wallet.provider);
            },
          },
        });
        await onboard.walletSelect();
        await onboard.walletCheck();
        // Update state with signer info
        const signer = provider.getSigner();
        await this.$store.dispatch('main/setWallet', signer);
        // Now we have a contract instance to use for sending transactions from
        // the selected wallet
        // this.ESRedemption = new ethers.Contract(addresses.ESRedemption, abi, signer);
      } catch (err) {
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
