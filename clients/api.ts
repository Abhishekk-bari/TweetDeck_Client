import { GraphQLClient } from 'graphql-request';

// api section

const isClient = typeof window !== "undefined";

export const graphqlClient = new GraphQLClient(
    "https://tweetdeck-server.onrender.com/graphql",
    {
        headers: () => ({
            Authorization: isClient 
            ? `Bearer ${window.localStorage.getItem("__twitter_token")}`
            : "",
        }),
}
);