import Image from "next/image";
import React from "react";

export default function Ad({ size }: { size: "sm" | "md" | "lg" }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-sm">
      {/* TOP */}
      <div className="flex justify-between items-center text-gray-500 font-medium">
        <span>Sponsored Ads</span>
        <Image src="/more.png" alt="" width={16} height={16} />
      </div>
      {/* BOTTOM */}
      <div
        className={`flex flex-col mt-4 ${size === "sm" ? "gap-2" : "gap-4"}`}
      >
        <div
          className={`relative ${
            size === "sm" ? "h-24" : size === "md" ? "h-36" : "h-48"
          }`}
        >
          <Image
            src="https://images.pexels.com/photos/27505450/pexels-photo-27505450.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
            alt=""
            fill
            className="rounded-lg object-cover"
          />
        </div>
        <div className="flex items-center gap-4">
          <Image
            src="https://images.pexels.com/photos/27505450/pexels-photo-27505450.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
            alt=""
            width={24}
            height={24}
            className="rounded-full w-6 h-6 object-cover"
          />
          <span className="text-blue-500 font-medium">BigChef Lounge</span>
        </div>
        <p className={size === "sm" ? "text-xs" : "text-sm"}>
          {size === "sm"
            ? "Lorem ipsum dolor sit amet consectetur, adipisicing elit."
            : size === "md"
            ? "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Laboriosam molestiae sint distinctio voluptates explicabo!"
            : "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Laboriosam molestiae sint distinctio voluptates explicabo! Et, sint, temporibus distinctio doloribus voluptate voluptatem alias voluptatum cumque nisi nihil tenetur incidunt, ut iste?"}
        </p>
        <button className="bg-gray-200 text-gray-500 p-2 rounded-lg text-xs">
          Learn More
        </button>
      </div>
    </div>
  );
}
