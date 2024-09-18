import React from 'react'
import Image from 'next/image'
import { FaRetweet } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import { CiHeart } from "react-icons/ci";
import { IoCloudUploadOutline } from "react-icons/io5";




const FeedCard: React.FC= () => {

    return (
    <div className="border border-r-0 border-l-0 border-b-0 border-gray-600 p-5 hover:bg-slate-900 transition-all cursor-pointer">
        <div className="grid grid-cols-12 gap-3">
            <div className="col-span-1">
            <Image src="https://avatars.githubusercontent.com/u/114674302?v=4" 
            alt="user-image"
            height={50}
            width={50}  /> 
            </div>

            <div className="col-span-11">
                <h5>Abhi Bari</h5>
                <p>
                    Is it just me or everyone else? Do you feel the code quality decrease as the project size increase
                </p>
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