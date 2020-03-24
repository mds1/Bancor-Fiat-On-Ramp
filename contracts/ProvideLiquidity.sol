pragma solidity ^0.6.0;

/**
Providing Liquidity on Bancor
source: https://docs.bancor.network/api-reference/ethereum-smart-contracts

Anyone can become a liquidity provider to a Relay and contribute to its reserves.
This is different than buying tokens on Bancor. It requires staking tokens in a
Relay. Users can stake their tokens in a Relay by buying “Relay Tokens” on
bancor.network, or through any third-party liquidity portal built atop the Bancor
Protocol. Relay Tokens can be sold at any time to withdraw a proportional share
of the Relay’s liquidity.

Each time a Relay processes a conversion, a small liquidity provider fee (usually
0.1-0.3%) is taken out of each trade and deposited into the Relay’s reserves.
These fees function as an incentive for liquidity providers who can withdraw
their proportional share of the reserves including the accumulated fees. The
larger a Relay’s reserves, the lower the slippage costs incurred by traders
transacting with the Relay, driving more conversion volume and, in turn, more
fees for liquidity providers.

Currently, whoever initiates the Relay determines its fees, while in the future,
liquidity providers will be able to vote on the Relay’s fee. Bancor takes no
platform fee from trades.
 */

contract ProvideLiquidity {

}