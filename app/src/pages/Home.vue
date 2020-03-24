<template>
  <q-page padding>
    <div class="text-center">
      <h2 class="text-bold q-mt-lg">
        Enter Liquidity Pools
      </h2>
      <h6 class="q-mt-md">
        Deposit into Bancor liquidity pools with fiat
      </h6>
    </div>

    <!-- Contract Interataction -->
    <div class="container q-py-xl">
      <div
        v-if="!userAddress"
        class="text-center"
      >
        <connect-wallet />
      </div>
      <div
        v-else
        class="row justify-center "
      >
        <deposit-with-wyre />
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import ConnectWallet from 'components/ConnectWallet';
import DepositWithWyre from 'components/DepositWithWyre';

export default {
  name: 'PageIndex',

  components: {
    ConnectWallet,
    DepositWithWyre,
  },

  computed: {
    ...mapState({
      userAddress: (state) => state.main.userAddress,
    }),
  },
};
</script>
