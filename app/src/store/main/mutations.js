export function setWallet(state, wallet) {
  try {
    // Object.assign fails if signer is undefined
    Object.assign(state.signer, wallet.signer);
    state.userAddress = '0'; // not reactive without this from initial undefined state
    state.userAddress = wallet.userAddress;
  } catch {
    state.signer = wallet.signer;
    state.userAddress = '0';
    state.userAddress = wallet.userAddress;
  }
}

export function setContracts(state, contracts) {
  try {
    Object.assign(state.contracts, contracts);
  } catch {
    state.contracts = contracts;
  }
}
