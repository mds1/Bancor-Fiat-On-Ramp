<template>
  <div>
    <q-card class="text-center q-pa-lg">
      <q-card-section>
        <h4 class="text-bold">
          Deposit
        </h4>
      </q-card-section>
      <q-card-section>
        <q-select
          v-model="selectedPool"
          class="q-mb-lg"
          :options="pools"
          label="Select Pool"
        />
        <q-input
          v-model.number="depositAmount"
          filled
          label="Deposit Amount"
        />
      </q-card-section>
      <q-card-section>
        <q-btn
          color="primary"
          label="Deposit"
          :loading="isLoading"
          :disabled="!Boolean(selectedPool) || !Boolean(depositAmount) || depositAmount <= 0"
          @click="startDeposit"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
export default {
  name: 'DepositWithWyre',

  data() {
    return {
      isLoading: false,
      contractAddress: undefined,
      pools: [
        { label: 'ETH-BNT', value: 'eth-bnt' },
      ],
      // User options
      depositAmount: undefined,
      selectedPool: null,
    };
  },

  methods: {
    startDeposit() {
      this.isLoading = true;
      try {
        // Check if we are in dev or prod
        let wyreUrlPrefix = 'sendwyre';
        if (process.env.WYRE_ENV === 'dev') {
          wyreUrlPrefix = 'testwyre';
        }

        // Define where to redirect to once hosted Widget flow is completed
        const widgetRedirectUrl = `${window.location.origin}`;

        // Define and temporarily save off options used to load the widget
        const widgetOptions = {
          dest: `ethereum:${this.contractAddress}`,
          destCurrency: 'ETH',
          sourceAmount: this.depositAmount,
          // paymentMethod: paymentType,
          redirectUrl: widgetRedirectUrl,
          accountId: process.env.WYRE_ACCOUNT_ID,
        };
        this.$q.localStorage.set('widgetDepositOptions', widgetOptions);

        // Load the new page and exit this function
        const widgetUrl = `https://pay.${wyreUrlPrefix}.com/purchase?dest=${widgetOptions.dest}&destCurrency=${widgetOptions.destCurrency}&sourceAmount=${widgetOptions.sourceAmount}&paymentMethod=${widgetOptions.paymentMethod}&redirectUrl=${widgetOptions.redirectUrl}&accountId=${widgetOptions.accountId}`;
        window.location.href = widgetUrl;
      } catch (err) {
        console.error(err); // eslint-disable-line no-console
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
