import {
  CollectionSortKey,
  SortDirection,
} from "@zoralabs/zdk/dist/queries/queries-sdk";
import { zdk } from "../zdk";
import { gqlClient } from "../graphql";
import { q } from "../queue";
import { end } from "../logger";

/*
 Notifies users about latest collections deployed to the network
 Uses `subs_latest_collections_deployed` table to get the list of subscribed users
**/

(async () => {
  const { collections } = await zdk.collections({
    where: { collectionAddresses: [] },
    sort: {
      sortKey: CollectionSortKey.Created,
      sortDirection: SortDirection.Desc,
    },
  });

  const cachedColl: any = await gqlClient.request(
    `
    query LatestColl {
      latestCollections(limit: 1, order_by: {ts: desc}) {
        name
        collectionAddress
      }
    }
    `
  );

  if (!collections) {
    throw new Error("Latest collections fetch was no successful");
  }

  // if latest cached collection address is not equal
  // to the latest fetched collection address -> update cache
  if (
    cachedColl.latestCollections[0].collectionAddress !==
    collections.nodes[0].address
  ) {
    const latestCollectionInsertResult: any = await gqlClient.request(
      `
      mutation LatestColl($address: String!, $name: String!) {
        insert_latestCollections(
          objects: {
            collectionAddress: $address, 
            name: $name
          }) {
          returning {
            ts
          }
        }
      }
      `,
      {
        address: collections.nodes[0].address,
        name: collections.nodes[0].name,
      }
    );

    if (
      !latestCollectionInsertResult.insert_latestCollections.returning[0].ts
    ) {
      throw Error("Latest collection insert was no successful");
    }

    // FIXME: ugly any
    const data: any = await gqlClient.request(
      `
      query UserSubscribtions {
        subs_latest_collections_deployed(limit: 100) {
          chatId
        }
      }
    `
    );

    if (!data || !data.subs_latest_collections_deployed) {
      throw new Error("Subscribtions fetch was no successful");
    }

    for (const sub of data.subs_latest_collections_deployed) {
      await q
        .push({
          chatId: sub.chatId,
          text: `New collection: ${collections.nodes[0].name!}: ${
            collections.nodes[0].address
          }`,
        })
        .catch((err) => console.error(err));
    }
  }

  end();
})();
