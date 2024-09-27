// import { useRouter } from "next/router";
import FeedCard from "@/components/FeedCard";
import Twitterlayout from "@/components/FeedCard/Layout/TwitterLayout";
import { Tweet } from "@/hooks/tweet";
import { useCurrentUser } from "@/hooks/user";
import { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";
import { graphqlClient } from "@/clients/api";
import { getUserByIdQuery } from "@/graphql/query/user";
import { useCallback, useMemo } from "react";
import { followUserMutation, unfollowUserMutation } from "@/graphql/mutation/user";
import { useQueryClient } from "@tanstack/react-query";

// Define the expected response type
interface GetUserByIdResponse {
  getUserById: {
    id: string;
    profileImageURL: string;
    tweets?: Tweet[];
    following?: { id: string }[];  // Ensure this field exists
    followers?: { id: string }[];  // Ensure this field exists
    firstName: string;
    lastName: string;
    // Add any other fields returned by the query
  };
}

interface ServerProps {
  userInfo?: GetUserByIdResponse["getUserById"]; // Adjusted typing here
}

// Define a proper User type including following and followers
interface CurrentUser {
  id: string;
  following?: { id: string }[]; // Ensure following is defined
}

const UserProfilePage: NextPage<ServerProps> = (props) => {
  // const {} = useRouter();                                  Error here today
  const { user: currentUser } = useCurrentUser() as { user: CurrentUser }; // Cast to include following
  const queryClient = useQueryClient();

  const amIFollowing = useMemo(() => {
    if (!props.userInfo) return false;
    return (
      (currentUser?.following?.findIndex(
        (el) => el?.id === props.userInfo?.id
      ) ?? -1) >= 0
    );
  }, [currentUser?.following, props.userInfo]);

  const handleFollowUser = useCallback(async () => {
    if (!props.userInfo?.id) return;
    await graphqlClient.request(followUserMutation, { to: props.userInfo?.id });
    
    await queryClient.invalidateQueries({ queryKey: ["current-user"] });
  }, [props.userInfo, queryClient]);                                       // here some error 
  
  const handleUnfollowUser = useCallback(async () => {
    if (!props.userInfo?.id) return;

    try {
      // Check if the follow relationship exists
      const followExists = await graphqlClient.request<{follows:[]}>( 
        `
        query CheckFollow($from: ID!, $to: ID!) {
          follows(where: { fromId: $from, toId: $to }) {
            id
          }
        }
        `,
        { from: currentUser?.id, to: props.userInfo?.id }
      );

      if (!followExists || !followExists.follows || followExists.follows.length === 0) {
        console.error("Follow relationship does not exist.");
        return;
      }

      // If follow relationship exists, proceed to unfollow
      await graphqlClient.request(unfollowUserMutation, { to: props.userInfo?.id });
      
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  }, [props.userInfo?.id, queryClient, currentUser?.id]);

  return (
    <div>
      <Twitterlayout>
        <div>
          <nav className="py-3 px-3 flex gap-3 item-center">
            <FaArrowLeft className="text-xl" />
            <div>
              <h1 className="text-1xl font-bold">
                {props.userInfo?.firstName} {props.userInfo?.lastName}
              </h1>
              <h1 className="text-md font-bold text-slate-500">
                {props.userInfo?.tweets?.length} Tweets
              </h1>
            </div>
          </nav>
          <div className="p-4 border-b border-slate-800">
            {props.userInfo?.profileImageURL && (
              <Image
                src={props.userInfo?.profileImageURL}
                alt="user-image"
                className="rounded-full"
                width={100}
                height={100}
              />
            )}
            <h1 className="text-2xl font-bold mt-5">
              {props.userInfo?.firstName} {props.userInfo?.lastName}
            </h1>
            <div className="flex justify-between items-center">
              <div className="flex gap-4 mt-2 text-sm text-grey-400">
                <span>{props.userInfo?.followers?.length} followers</span>
                <span>{props.userInfo?.following?.length} following</span>
              </div>
              {currentUser?.id !== props.userInfo?.id && (
                <>
                  {amIFollowing ? (
                    <button onClick={handleUnfollowUser} className="bg-white text-black px-3 py-1 rounded-full text-sm">
                      Unfollow
                    </button>
                  ) : (
                    <button
                      onClick={handleFollowUser}
                      className="bg-white text-black px-3 py-1 rounded-full text-sm"
                    >
                      Follow
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div>
            {(props.userInfo as { tweets?: Tweet[] })?.tweets?.map((tweet) => (
              <FeedCard data={tweet as Tweet} key={tweet?.id} />
            ))}
          </div>
        </div>
      </Twitterlayout>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<ServerProps> = async (context) => {
  const id = context.query.id as string | undefined;

  if (!id) return { notFound: true, props: { userInfo: undefined } };

  // Properly typing the request response
  const userInfo: GetUserByIdResponse = await graphqlClient.request(getUserByIdQuery, { id });

  if (!userInfo?.getUserById) return { notFound: true };

  return {
    props: {
      userInfo: userInfo.getUserById,
    },
  };
};

export default UserProfilePage;