export async function setWallet({ commit }, signer) {
  const userAddress = await signer.getAddress();
  commit('setWallet', { signer, userAddress });
}
