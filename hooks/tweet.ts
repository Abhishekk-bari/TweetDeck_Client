import { graphqlClient } from '@/clients/api';
// @ts-expect-error: ok--ok
import { CreateTweetData } from '@/gql/graphql'; // Make sure this path is correct
import { createTweetMutation } from '@/graphql/mutation/tweet';
import { getAllTweetsQuery } from '@/graphql/query/tweet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export const useCreateTweet = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (payload: CreateTweetData) => 
            graphqlClient.request(createTweetMutation, { payload }),
        onMutate: () => {
            // Show loading toast with a specific ID
            toast.loading('Creating Tweet', { id: "1" });
        },
        onSuccess: async () => {
            // Invalidate queries to refetch data
            await queryClient.invalidateQueries({
                queryKey: ["all-tweets"],
            });
            // Show success toast with the same ID to replace the loading toast
            toast.success("Created Successfully", { id: "1" });
        },
    });

    return mutation;
};

export interface Tweet {
    author: any;
    imageURL: any;
    id: string;
    content: string;
    // Add other tweet properties as needed
}

interface GetAllTweetsResponse {
    getAllTweets: Tweet[];
}

export const useGetAllTweets = () => {
    const query = useQuery<GetAllTweetsResponse>({
        queryKey: ["all-tweets"],
        queryFn: () => graphqlClient.request<GetAllTweetsResponse>(getAllTweetsQuery)
    });

    return { ...query, tweets: query.data?.getAllTweets };
}