import React, { useCallback, useState } from "react";
import { useCurrentUser } from "@/hooks/user";
import Image from "next/image";
import { Tweet, useCreateTweet, useGetAllTweets } from "@/hooks/tweet";
import Twitterlayout from "@/components/FeedCard/Layout/TwitterLayout";
import { FaRegImage } from "react-icons/fa";
import FeedCard from "@/components/FeedCard";
import { GetServerSideProps } from "next";
import { getAllTweetsQuery, getSignedURLForTweetQuery } from '@/graphql/query/tweet';
import { graphqlClient } from './../clients/api';
import axios from "axios";
import toast from "react-hot-toast";




// Define the expected GraphQL response type for fetching tweets
interface GetAllTweetsResponse {
  getAllTweets: Tweet[];
}

// Define the expected GraphQL response type for signed URL
interface GetSignedURLResponse {
  getSignedURLForTweet: string;
}

// Define the props interface for the Home component
interface HomeProps {
  tweets?: Tweet[];
}

// Home component definition
export default function Home(props: HomeProps) {
  // Get the current user data
  const { user } = useCurrentUser();
  // Get tweets and fallback to server-side props if no tweets from the hook
  const { tweets = props.tweets as Tweet[] } = useGetAllTweets();
  // Define a function to create a new tweet
  const { mutateAsync } = useCreateTweet();

  // State management for tweet content and image URL
  const [content, setContent] = useState("");
  const [imageURL, setImageURL] = useState("");

  // Function to handle file input change, uploads an image and retrieves its URL
  const handleInputChangeFile = useCallback((input: HTMLInputElement) => {
    return async (event: Event) => {
      event.preventDefault();
      const file: File | null | undefined = input.files?.item(0); // Get selected file
      if (!file) return;

      // Request a signed URL from the server for uploading the image
      const { getSignedURLForTweet } = await graphqlClient.request<GetSignedURLResponse>(getSignedURLForTweetQuery, {
        imageName: file.name,
        imageType: file.type
      });

      if (getSignedURLForTweet) {
        // Show a toast while uploading the image
        toast.loading('Uploading...', { id: '2' });
        // Upload the image to the signed URL
        await axios.put(getSignedURLForTweet, file, {
          headers: {
            'Content-Type': file.type
          }
        });
        toast.success('Upload Complete', { id: '2' });
        
        // Set the image URL after a successful upload
        const url = new URL(getSignedURLForTweet);
        const myFilePath = `${url.origin}${url.pathname}`;
        setImageURL(myFilePath);
      }
    };
  }, []);

  // Function to open a file input and handle image selection
  const handleSelectImage = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");

    // Attach change handler for file input
    const handlerFn = handleInputChangeFile(input);
    input.addEventListener('change', handlerFn);
    
    // Trigger file input click to open the file selector
    input.click();
  }, [handleInputChangeFile]);

  // Function to create a new tweet with content and an optional image
  const handleCreatedTweet = useCallback(async () => {
    // Submit the new tweet with content and image URL
    await mutateAsync({
      content,
      imageURL,
    });
    // Clear the tweet content and image URL after submission
    setContent("");
    setImageURL("");
  }, [content, mutateAsync, imageURL]);

  return (
    <div>
      <Twitterlayout>
        <div>
          {/* Input section for creating a new tweet */}
          <div className="border border-r-0 border-l-0 border-b-0 border-gray-600 p-5 hover:bg-slate-900 transition-all cursor-pointer">
            <div className="grid grid-cols-12 gap-1">
              <div className="col-span-1">
                {/* Display the user's profile image if available */}
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
                {/* Textarea for writing tweet content */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-transparent text-xl px-3 border-b border-slate-700"
                  rows={3}
                  placeholder="What's happening?"
                ></textarea>

                {/* Display the uploaded image if available */}
                {imageURL && (
                  <Image
                    src={imageURL}
                    alt="tweet-image"
                    width={300}
                    height={300}
                  />
                )}

                <div className="mt-2 flex justify-between items-center">
                  {/* Icon to select an image for the tweet */}
                  <FaRegImage onClick={handleSelectImage} className="text-sm" />
                  {/* Button to submit the tweet */}
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

        {/* Render a list of tweets using the FeedCard component */}
        {tweets?.map((tweet) =>
          tweet ? <FeedCard key={tweet?.id} data={tweet as Tweet} /> : null
        )}
      </Twitterlayout>
    </div>
  );
}

// getServerSideProps fetches all tweets from the server
export const getServerSideProps: GetServerSideProps<HomeProps> = async (context) => {
  try {
    // Request all tweets from GraphQL API
    const allTweets = await graphqlClient.request<GetAllTweetsResponse>(getAllTweetsQuery);  // Explicitly define response type

    return {
      props: {
        tweets: allTweets.getAllTweets, // Pass tweets as props
      },
    };
  } catch (error) {
    console.error("Error fetching tweets:", error);
    return {
      props: {
        tweets: [], // If an error occurs, return an empty array
      },
    };
  }
};
