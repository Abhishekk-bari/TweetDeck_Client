import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { BsTwitter } from "react-icons/bs";
import {
  MdHomeFilled,
  MdNotificationsActive,
  MdBookmarkAdd,
  MdOutlineAccountCircle,
} from "react-icons/md";
import { FaSlackHash, FaEnvelope } from "react-icons/fa";
import { CgMoreO } from "react-icons/cg";
import { useCurrentUser } from "@/hooks/user";
import Image from 'next/image';
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useQueryClient } from '@tanstack/react-query';
import Link from "next/link";
import toast from "react-hot-toast";
import { graphqlClient } from "@/clients/api";
import { verifyUserGoogleTokenQuery } from "@/graphql/query/user";

interface VerifyGoogleTokenResponse {
  verifyGoogleToken: string;
}

interface TwitterlayoutProps {
  children: React.ReactNode;
}

const Twitterlayout: React.FC<TwitterlayoutProps> = (props) => {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const feedRef = useRef<HTMLDivElement>(null); // Reference for the feed section

  const SidebarMenuItems = useMemo(() => [
    { title: "Home", icon: <MdHomeFilled />, link: '/' },
    { title: "Explore", icon: <FaSlackHash />, link: '/' },
    { title: "Notify", icon: <MdNotificationsActive />, link: '/' },
    { title: "Messages", icon: <FaEnvelope />, link: '/' },
    { title: "Bookmark", icon: <MdBookmarkAdd />, link: '/' },
    { title: "Profile", icon: <MdOutlineAccountCircle />, link: `/${user?.id}` },
    { title: "More", icon: <CgMoreO />, link: '/' },
  ], [user?.id]);

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

        if (verifyGoogleToken) {
          window.localStorage.setItem('__twitter_token', verifyGoogleToken);
          toast.success('Verified successfully');
          await queryClient.invalidateQueries({ queryKey: ['current-user'] });
        }
      } catch (error) {
        console.error('Error during GraphQL request:', error);
        toast.error('Verification failed');
      }
    },
    [queryClient]
  );

  // Scroll event handler
  const handleScroll = useCallback(() => {
    if (feedRef.current) {
      console.log("Feed section scrolled", feedRef.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    const feedElement = feedRef.current;
    if (feedElement) {
      feedElement.addEventListener("scroll", handleScroll);
      return () => {
        feedElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  return (
    <div>
      <div className="grid grid-cols-12 h-screen w-screen sm:px-56">
        <div className="col-span-2 sm:col-span-3 pt-1 flex sm:justify-end pr-4 relative ">
          <div>
            <div className="text-2xl hover:bg-gray-800 p-4 rounded-full w-fit cursor-pointer transition-all ">
              <BsTwitter />
            </div>

            <div className="mt-1 pr-5 text-xl ">
              <ul>
                {SidebarMenuItems.map((item) => (
                  <li key={item.title}>
                    <Link className="flex justify-start items-center gap-4 hover:bg-gray-800 rounded-full px-3 py-3 w-fit cursor-pointer" href={item.link}>
                      <span className="text-3xl">{item.icon}</span>
                      <span className="hidden sm:inline ">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-10 px-5">
                <button className="hover:bg-blue-500 font-semibold text-lg py-2 px-4 rounded-full w-full hidden sm:block">
                  Tweet
                </button>
                <button className="block sm:hidden bg-blue-500 font-semibold text-lg py-2 px-4 rounded-full w-full">
                  <BsTwitter />
                </button>
              </div>
            </div>
          </div>

          {user && (
            <div className="absolute bottom-5 flex gap-2 items-center bg-slate-800  px-3 py-2 rounded-full">
              {user.profileImageURL && (
                <Image
                  className="rounded-full"
                  src={user.profileImageURL}
                  alt="user-image"
                  height={40}
                  width={40}
                />
              )}
              <div className="hidden sm:block">
                <h3 className="text-lg">
                  {user.firstName} {user.lastName}
                </h3>
              </div>
            </div>
          )}
        </div>

        {/* Feed Section with hidden scrollbar */}
        <div
          ref={feedRef} // Assigning the feed section reference
          className="col-span-10 sm:col-span-5 border-r-[1px] border-l-[1px] h-screen border-gray-600 overflow-y-auto scrollbar-hide" // Added 'scrollbar-hide' class
        >
          {props.children}
        </div>

        <div className="col-span-0 sm:col-span-3 p-5">
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
};

export default Twitterlayout;
