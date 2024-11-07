import React from "react";
import Post from "./Post";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

export default async function Feed({ username }: { username?: string }) {
  const { userId } = auth();

  let posts: any = [];
  // 如果有username，则显示该用户的所有帖子
  if (username) {
    posts = await prisma.post.findMany({
      where: {
        user: {
          username: username,
        },
      },
      include: {
        user: true,
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
  // 如果没有username，则显示当前用户的朋友的所有帖子
  if (!username && userId) {
    const following = await prisma.follower.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });
    const followingIds = following.map((item) => item.followingId);
    const ids = [userId, ...followingIds];

    posts = await prisma.post.findMany({
      where: {
        userId: {
          in: ids,
        },
      },
      include: {
        user: true,
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
  return (
    <div className="p-4 bg-white rounded-lg shadow-md flex gap-12 flex-col">
      {posts.length
        ? posts.map((post: any) => <Post key={post.id} post={post} />)
        : "No posts found!"}
    </div>
  );
}
