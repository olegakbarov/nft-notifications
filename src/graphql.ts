import { GraphQLClient } from "graphql-request";

if (!process.env.GRAPHQL_ENDPOINT || !process.env.HASURA_SECRET) {
  throw new Error("GRAPHQL_ENDPOINT or HASURA_SECRET is not set");
}

export const gqlClient = new GraphQLClient(process.env.GRAPHQL_ENDPOINT, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_SECRET,
  },
});
