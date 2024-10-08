import React from 'react'
import Image from 'next/image'
import { FaRetweet } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import { CiHeart } from "react-icons/ci";
import { IoCloudUploadOutline } from "react-icons/io5";
import { Tweet } from '@/hooks/tweet'
import Link from 'next/link';



interface FeedCardProps {
    data: Tweet
}

const FeedCard: React.FC<FeedCardProps> = (props) => {
    const { data } = props

    return (
    <div className="border border-r-0 border-l-0 border-b-0 border-gray-600 p-5 hover:bg-slate-900 transition-all cursor-pointer">
        <div className="grid grid-cols-12 gap-2">
            <div className="col-span-1">
            {data.author.profileImageURL && 
            <Image 
            className="rounded-full"
            src={data.author.profileImageURL} 
            alt="user-image"
            height={50}
            width={50}  
            />} 
            </div>

            <div className="col-span-9">                                             {/* Symbol in feed section like,comment etc.. */}
                <h5>
                    <Link href={`/${data.author?.id}`}>{data.author?.firstName} {data.author?.lastName}</Link>
                </h5>
                <p>{data.content}</p>
                {
                    data.imageURL && <Image src={data.imageURL} alt="image" width={400} height={400} />
                }
                <div className="flex justify-between mt-5 items-center text-xl p-2 ">
                <div>
                <FiMessageCircle />
                </div>
                <div>
                    <FaRetweet />
                </div>
                <div>
                    <CiHeart />   
                </div>
                <div>
                    <IoCloudUploadOutline />
                </div>
                </div>
            </div>
        </div>
    </div>
)
};
export default FeedCard;