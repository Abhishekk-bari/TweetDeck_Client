import { BsTwitter } from 'react-icons/bs';
import { MdHomeFilled, MdNotificationsActive, MdBookmarkAdd, MdOutlineAccountCircle } from 'react-icons/md';
import { FaSlackHash, FaEnvelope } from 'react-icons/fa';
import { CgMoreO } from 'react-icons/cg';
import { FaRegImage } from "react-icons/fa6";
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import React, { useCallback } from 'react';

import FeedCard from '@/components/FeedCard';
import { verifyUserGoogleTokenQuery } from '@/graphql/query/user';
import { graphqlClient } from '@/clients/api';
import { toast } from 'react-hot-toast';
import { useCurrentUser } from '@/hooks/user';
import { useQueryClient } from '@tanstack/react-query';

// Import Image from next/image
import Image from 'next/image';
import { PiPlaceholder } from 'react-icons/pi';

// Define the interface for the GraphQL response
interface VerifyGoogleTokenResponse {
  verifyGoogleToken: string;
}

interface TwitterSidebarButton {
  title: string;
  icon: React.ReactNode;
}

const SidebarMenuItem: TwitterSidebarButton[] = [
  { title: 'Home', icon: <MdHomeFilled /> },
  { title: 'Explore', icon: <FaSlackHash /> },
  { title: 'Notify', icon: <MdNotificationsActive /> },
  { title: 'Messages', icon: <FaEnvelope /> },
  { title: 'Bookmark', icon: <MdBookmarkAdd /> },
  { title: 'Profile', icon: <MdOutlineAccountCircle /> },
  { title: 'More', icon: <CgMoreO /> },
];

export default function Home() {
  
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  const handleSelectImage = useCallback(() => {
    const input = document.createElement('input')
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click()
  },[])


  const handleLoginWithGoogle = useCallback(
    async (cred: CredentialResponse) => {
      const googleToken = cred.credential;
      if (!googleToken) return toast.error(`Google token not found`);

      try {
        const response = await graphqlClient.request<VerifyGoogleTokenResponse>(
          verifyUserGoogleTokenQuery,
          { token: googleToken }
        );

        const { verifyGoogleToken } = response;

        // Store the token in local storage
        if (verifyGoogleToken) {
          window.localStorage.setItem('__twitter_token', verifyGoogleToken);
          toast.success('Verified successfully');
          console.log(verifyGoogleToken);

          // Invalidate the 'current-user' query to refetch updated user data
          await queryClient.invalidateQueries({ queryKey: ['current-user'] });
        }
      } catch (error) {
        console.error('Error during GraphQL request:', error);
        toast.error('Verification failed');
      }
    },
    [queryClient]
  );

  return (
    <div>
      <div className="grid grid-cols-12 h-screen w-screen px-56">
        <div className="col-span-3 pt-1 ml-28 relative ">
          <div className="text-2xl hover:bg-gray-800 p-4 rounded-full w-fit cursor-pointer transition-all ">
            <BsTwitter />
          </div>

          {/* List */}
          <div className="mt-1 pr-5 text-xl ">
            <ul>
              {SidebarMenuItem.map((item) => (
                <li
                  className="flex justify-start items-center gap-4 hover:bg-gray-800 rounded-full px-3 py-3 w-fit cursor-pointer"
                  key={item.title}
                >
                  <span>{item.icon}</span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 px-5">
              <button className="hover:bg-blue-500 font-semibold text-lg py-2 px-4 rounded-full w-full">
                Tweet
              </button>
            </div>
          </div>

          {user &&(
            <div className="absolute bottom-5 flex gap-2 items-center bg-slate-800  px-3 py-2 rounded-full">
            {user && user.profileImageURL && (
              <Image
              className="rounded-full"
                src={user?.profileImageURL}
                alt="user-image"
                height={40}
                width={40}
              />
            )}
            <div>
            <h3 className="text-lg">
              {user.firstName} {user.lastName}
            </h3>
            </div>
          </div>
          )}
        </div>

        <div className="col-span-5 border-r-[1px] border-l-[1px] h-screen border-gray-600">
          <div>
          <div className="border border-r-0 border-l-0 border-b-0 border-gray-600 p-5 hover:bg-slate-900 transition-all cursor-pointer">
          <div className="grid grid-cols-12 gap-3">
          <div className="col-span-1">
            {user?.profileImageURL&&( 
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
            className=" w-full bg-transparent text-xl px-3 border-b border-slate-700" 
            rows={3}
            placeholder="Whats happening?"
            ></textarea>
            <div className="mt-2 flex justify-between items-center">
              <FaRegImage 
              onClick={handleSelectImage}
              className="text-sm"
              />
              <button className="bg-[#1d9bf0] font-semibold text-sm py-1 px-4 rounded-full">
                Tweet</button>
            </div>
          </div>
          </div>
          </div>
          </div>
          <FeedCard />
          <FeedCard />
          <FeedCard />
          <FeedCard />
        </div>

        <div className="col-span-3 p-5">
          {!user && (
            <div className="p-5 bg-slate-700 rounded-lg">
              <h1 className="my-1 text-1xl">New user Here?</h1>
              <GoogleLogin onSuccess={handleLoginWithGoogle} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
