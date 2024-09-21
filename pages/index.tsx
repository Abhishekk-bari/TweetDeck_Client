import React, { useCallback, useState } from "react";
import { useCurrentUser } from "@/hooks/user";
import Image from "next/image";
import { Tweet, useCreateTweet } from "@/hooks/tweet";
import Twitterlayout from "@/components/FeedCard/Layout/TwitterLayout";
import { FaRegImage } from "react-icons/fa";
import FeedCard from "@/components/FeedCard";
import { GetServerSideProps } from "next";
import { getAllTweetsQuery } from '@/graphql/query/tweet';
import { graphqlClient } from './../clients/api';

// Define the expected GraphQL response type
interface GetAllTweetsResponse {
  getAllTweets: Tweet[];
}

interface HomeProps {
  tweets?: Tweet[];
}

export default function Home(props: HomeProps) {
  const { user } = useCurrentUser();
  const { mutate } = useCreateTweet();

  const [content, setContent] = useState("");

  const handleSelectImage = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
  }, []);

  const handleCreatedTweet = useCallback(() => {
    mutate({
      content,
    });
  }, [content, mutate]);

  return (
    <div>
      <Twitterlayout>
        <div>
          <div className="border border-r-0 border-l-0 border-b-0 border-gray-600 p-5 hover:bg-slate-900 transition-all cursor-pointer">
            <div className="grid grid-cols-12 gap-1">
              <div className="col-span-1">
                {user?.profileImageURL && (
                  <Image
                    className="rounded-full"
                    src={user?.profileImageURL}
                    alt="user-image"
                    height={50}
                    width={50}
                  />
                )}
              </div>
              <div className="col-span-11">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-transparent text-xl px-3 border-b border-slate-700"
                  rows={3}
                  placeholder="What's happening?"
                ></textarea>
                <div className="mt-2 flex justify-between items-center">
                  <FaRegImage onClick={handleSelectImage} className="text-sm" />
                  <button
                    onClick={handleCreatedTweet}
                    className="bg-[#1d9bf0] font-semibold text-sm py-1 px-4 rounded-full"
                  >
                    Tweet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {props.tweets?.map((tweet) =>
          tweet ? <FeedCard key={tweet?.id} data={tweet as Tweet} /> : null
        )}
      </Twitterlayout>
    </div>
  );
}

// getServerSideProps fetches all tweets from the server
export const getServerSideProps: GetServerSideProps<HomeProps> = async (context) => {
  try {
    // Request all tweets from GraphQL
    const allTweets = await graphqlClient.request<GetAllTweetsResponse>(getAllTweetsQuery);  // Explicitly define response type

    return {
      props: {
        tweets: allTweets.getAllTweets, // Now allTweets is properly typed as Tweet[]
      },
    };
  } catch (error) {
    console.error("Error fetching tweets:", error);
    return {
      props: {
        tweets: [], // If error, return an empty array of tweets
      },
    };
  }
};
