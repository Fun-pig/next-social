import prisma from "@/lib/client";
import Image from "next/image";
import React from "react";
import CommentList from "./CommentList";

export default async function Comments({ postId }: { postId: number }) {
  const comments = await prisma.comment.findMany({
    where: {
      postId: postId,
    },
    include: {
      user: true,
    },
  });
  return (
    <div>
      {/* WRITE */}
      <CommentList comments={comments} postId={postId} />
    </div>
  );
}
