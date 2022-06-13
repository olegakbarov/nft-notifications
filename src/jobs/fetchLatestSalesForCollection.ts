import {
  SaleSortKey,
  SaleWithToken,
  SortDirection,
} from "@zoralabs/zdk/dist/queries/queries-sdk";
import { zdk } from "../zdk";
import { gqlClient } from "../graphql";
import { q } from "../queue";
import { end, log } from "../logger";

const createMessageFromData = (saleWithToken: SaleWithToken) => {
  const collName = saleWithToken.token?.collectionName;
  const tokenName = saleWithToken.token?.name;
  const ethPrice = saleWithToken.sale.price.nativePrice;
  const usdPrice = saleWithToken.sale.price.nativePrice.decimal;

  return `${collName}: ${tokenName} was sold for ${ethPrice}ETH ($${usdPrice})`;
};

type LatestCollectionSubscription = {
  collectionAddress: string;
  chatId: number;
};

(async () => {
  const subscribedUsersList: any = await gqlClient.request(
    `
      query LatestSalesSubs {
          subs_latest_sales(limit: 100) {
            collectionAddress
            chatId
        }
      }
    `
  );

  const subs: LatestCollectionSubscription[] =
    subscribedUsersList?.subs_latest_sales;
  const collectionAddresses: string[] = subs.map(
    (sub: any) => sub.collectionAddress
  );
  // const recipientsChatIds: number[] = subs.map((sub: any) => sub.chatId);

  log(`subscribedUsersList: ${JSON.stringify(subscribedUsersList)}`);

  // if collectionAddresses length > than api accepts we are screwed
  const { sales } = await zdk.sales({
    where: { collectionAddresses: collectionAddresses },
    sort: {
      sortDirection: SortDirection.Desc,
      sortKey: SaleSortKey.Time,
    },
    filter: {},
    includeFullDetails: false,
  });

  if (!sales) {
    throw new Error("Subscribtions fetch was not successful");
  }

  for (const item of subs) {
    const latestSalePerCollection = sales.nodes.find(
      (tws) => tws.token?.collectionAddress === item.collectionAddress
    );
    if (!latestSalePerCollection) {
      console.log(`No sale found for ${item.collectionAddress}`);
      return;
    }
    await q
      .push({
        chatId: item.chatId,
        // check SaleWithToken type signature
        text: createMessageFromData(latestSalePerCollection as any),
      })
      .catch((err) => console.error(err));
  }

  end();
})();
