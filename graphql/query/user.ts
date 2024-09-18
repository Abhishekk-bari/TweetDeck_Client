import { graphql } from "../../gql";

export const verifyUserGoogleTokenQuery = graphql(`
  #graphql
  query verifyGoogleToken($token: String!) {
    verifyGoogleToken(token: $token)
  }
`);

export const getCurrentUserQuery = graphql(`
query GetCurrentUser {
  getCurrentUser {
    id
    profileImageURL
    email
    firstName
    lastName
  }
}
`);