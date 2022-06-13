import {
  SaleSortKey,
  SaleWithToken,
  SortDirection,
} from "@zoralabs/zdk/dist/queries/queries-sdk";
import { zdk } from "../zdk";
import { gqlClient } from "../graphql";
import { q } from "../queue";
import { end, log } from "../logger";
import { contracts } from "../constants";

const createMessageFromData = (saleWithToken: SaleWithToken) => {
  const address = saleWithToken.token?.collectionAddress;
  const collName = saleWithToken.token?.collectionName;
  const tokenName = saleWithToken.token?.name;
  const ethPrice = saleWithToken.sale.price.nativePrice.decimal;
  const usdPrice = saleWithToken.sale.price.nativePrice.decimal;

  return `<a href="https://etherscan.io/address/${address}">${
    collName || address
  }: ${tokenName} was sold for ${ethPrice} ETH ($${usdPrice})`;
};

type LatestCollectionSubscription = {
  collection_address: string;
  chat_id: number;
};

(async () => {
  const subscribedUsersList: any = await gqlClient.request(
    `
      query LatestSalesSubs {
          subs_latest_sales(limit: 2000) {
            collection_address
            chat_id
        }
      }
    `
  );

  const subs: LatestCollectionSubscription[] =
    subscribedUsersList?.subs_latest_sales;

  // const recipientsChatIds: number[] = subs.map((sub: any) => sub.chatId);
  // log(`subscribedUsersList: ${JSON.stringify(subscribedUsersList)}`);
  // if collectionAddresses length > than api accepts we are screwed

  const { sales } = await zdk.sales({
    where: { collectionAddresses: contracts },
    sort: {
      sortDirection: SortDirection.Desc,
      sortKey: SaleSortKey.Time,
    },
    filter: {},
    includeFullDetails: false,
  });

  log(`sales.length: ${sales.nodes.length}`);

  if (!sales) {
    log("ERROR!: Subscribtions fetch was not successful");
    end();
  }

  for (const item of subs) {
    log(`item.collection_address: ${item.collection_address}`);

    const latestSalePerCollection = sales.nodes.find(
      (tws) => tws.sale.collectionAddress === item.collection_address
    );

    log(JSON.stringify(latestSalePerCollection));

    if (!latestSalePerCollection) {
      // log(`No sale found for ${item.collection_address}`);
      continue;
    } else {
      log(`Sale found for ${item.collection_address}`);
      await q
        .push({
          chatId: item.chat_id,
          // check SaleWithToken type signature
          text: createMessageFromData(latestSalePerCollection as any),
        })
        .catch((err) => log(JSON.stringify(err)));
    }
  }

  end();
})();
