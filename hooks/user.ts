import { getCurrentUserQuery } from "@/graphql/query/user";
import { useQuery } from "@tanstack/react-query";
import { graphqlClient } from "@/clients/api";
import { ReactNode } from "react";

// Define the expected shape of the response
interface CurrentUserResponse {
  getCurrentUser: {
    firstName: ReactNode;
    lastName: ReactNode;
    id: string;
    name: string;
    email: string;
    profileImageURL?: string;
    // Add any other fields you expect from the 'getCurrentUser' response
  };
}

export const useCurrentUser = () => {
  const query = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      // Use the correct type for the response
      const response = await graphqlClient.request<CurrentUserResponse>(getCurrentUserQuery);
      return response;
    },
  });

  return { ...query, user: query.data?.getCurrentUser };
};
