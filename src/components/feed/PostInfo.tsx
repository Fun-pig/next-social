"use client";

import { deletePost } from "@/lib/actions";
import Image from "next/image";
import { useState } from "react";

export default function PostInfo({ postId }: { postId: number }) {
  const [open, setOpen] = useState(false);
  const deletePostWithId = deletePost.bind(null, postId);
  return (
    <div className="relative">
      <Image
        src="/more.png"
        alt=""
        width={16}
        height={16}
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer"
      />
      {open && (
        <div className="absolute top-4 right-0 bg-white rounded-lg shadow-md p-4 w-32 flex flex-col gap-2 text-xs z-30">
          <span className="cursor-pointer">View</span>
          <span className="cursor-pointer">Re-post</span>
          <form action={deletePostWithId}>
            <button className="text-red-500">Delete</button>
          </form>
        </div>
      )}
    </div>
  );
}
