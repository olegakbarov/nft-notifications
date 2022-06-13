import { ZDK, ZDKChain, ZDKNetwork } from "@zoralabs/zdk/dist/index";

export const zdk = new ZDK({
  endpoint: "https://api.zora.co/graphql",
  networks: [
    {
      chain: ZDKChain.Mainnet,
      network: ZDKNetwork.Ethereum,
    },
  ],
});
