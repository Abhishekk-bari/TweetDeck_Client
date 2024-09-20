import { useRouter } from "next/router";
import FeedCard from "@/components/FeedCard";
import Twitterlayout from "@/components/FeedCard/Layout/TwitterLayout";
import { Tweet } from "@/hooks/tweet";
import { useCurrentUser } from "@/hooks/user";
import { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";
import { graphqlClient } from "@/clients/api";
import { getUserByIdQuery } from "@/graphql/query/user";

// Define the expected response type
interface GetUserByIdResponse {
  getUserById: {
    id: string;
    profileImageURL: string;
    tweets?: Tweet[];
    // Add any other fields returned by the query
  };
}

const UserProfilePage: NextPage = () => {
  const { user } = useCurrentUser();
  const router = useRouter();

  return (
    <div>
      <Twitterlayout>
        <div>
          <nav className="py-3 px-3 flex gap-3 item-center">
            <FaArrowLeft className="text-xl" />
            <div>
              <h1 className="text-1xl font-bold">Abhishek Bari</h1>
              <h1 className="text-md font-bold text-slate-500">34 Tweets</h1>
            </div>
          </nav>
          <div className="p-4 border">
            {user?.profileImageURL && (
              <Image
                src={user?.profileImageURL}
                alt="user-image"
                className="rounded-full"
                width={100}
                height={100}
              />
            )}
            <h1 className="text-2xl font-bold mt-5">Abhishek Bari</h1>
          </div>

          <div>
            {(user as { tweets?: Tweet[] })?.tweets?.map((tweet) => (
              <FeedCard data={tweet as Tweet} key={tweet?.id} />
            ))}
          </div>
        </div>
      </Twitterlayout>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.query.id as string | undefined;

  if (!id) return { notFound: true };

  // Properly typing the request response
  const userInfo: GetUserByIdResponse = await graphqlClient.request(getUserByIdQuery, { id });

  if (!userInfo?.getUserById) return { notFound: true };

  return {
    props: {
      userInfo: userInfo.getUserById, // This is now correctly typed
    },
  };
};

export default UserProfilePage;
