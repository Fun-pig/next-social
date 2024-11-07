"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "./client";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export const switchFollow = async (userId: string) => {
  const { userId: currentUserId } = auth();
  if (!currentUserId) {
    throw new Error("user is not authenticated");
  }
  try {
    const isExistingFollow = await prisma.follower.findFirst({
      where: {
        followerId: currentUserId,
        followingId: userId,
      },
    });
    if (isExistingFollow) {
      await prisma.follower.delete({ where: { id: isExistingFollow.id } });
    } else {
      const existingFollowRequest = await prisma.followerRequest.findFirst({
        where: {
          senderId: currentUserId,
          receiverId: userId,
        },
      });
      if (existingFollowRequest) {
        await prisma.followerRequest.delete({
          where: { id: existingFollowRequest.id },
        });
      } else {
        await prisma.followerRequest.create({
          data: {
            senderId: currentUserId,
            receiverId: userId,
          },
        });
      }
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to switch follow");
  }
};

export const switchBlock = async (userId: string) => {
  const { userId: currentUserId } = auth();
  if (!currentUserId) {
    throw new Error("user is not authenticated");
  }
  try {
    const existingBlock = await prisma.block.findFirst({
      where: {
        blockerId: currentUserId,
        blockedId: userId,
      },
    });

    if (existingBlock) {
      await prisma.block.delete({
        where: {
          id: existingBlock.id,
        },
      });
    } else {
      await prisma.block.create({
        data: {
          blockerId: currentUserId,
          blockedId: userId,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const acceptFollowRequest = async (userId: string) => {
  const { userId: currentUserId } = auth();
  if (!currentUserId) {
    throw new Error("user is not authenticated");
  }
  try {
    const existingFollowRequest = await prisma.followerRequest.findFirst({
      where: {
        senderId: userId,
        receiverId: currentUserId,
      },
    });
    if (existingFollowRequest) {
      await prisma.followerRequest.delete({
        where: { id: existingFollowRequest.id },
      });
      await prisma.follower.create({
        data: {
          followerId: userId,
          followingId: currentUserId,
        },
      });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const declineFollowRequest = async (userId: string) => {
  const { userId: currentUserId } = auth();
  if (!currentUserId) {
    throw new Error("user is not authenticated");
  }
  try {
    const existingFollowRequest = await prisma.followerRequest.findFirst({
      where: {
        senderId: userId,
        receiverId: currentUserId,
      },
    });
    if (existingFollowRequest) {
      await prisma.followerRequest.delete({
        where: { id: existingFollowRequest.id },
      });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const updateProfile = async (
  prevState: { success: boolean; error: boolean },
  payload: { formData: FormData; cover: string }
) => {
  const { formData, cover } = payload;
  // const name = formData.get("name") as string;
  const fields = Object.fromEntries(formData);

  // 把空字符串的字段过滤掉
  const filteredFields = Object.fromEntries(
    Object.entries(fields).filter(([key, value]) => value !== "")
  );

  // 字段校验
  const Profile = z.object({
    cover: z.string().optional(),
    name: z.string().max(60).optional(),
    username: z.string().max(60).optional(),
    surname: z.string().max(60).optional(),
    description: z.string().max(255).optional(),
    city: z.string().max(60).optional(),
    school: z.string().max(60).optional(),
    work: z.string().max(60).optional(),
    website: z.string().max(60).optional(),
  });
  const validatedFields = Profile.safeParse({ cover, ...filteredFields });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return { success: false, error: true };
  }

  const { userId } = auth();
  if (!userId) {
    return { success: false, error: true };
  }
  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: validatedFields.data,
    });
    return { success: true, error: false };
  } catch (error) {
    return { success: false, error: true };
  }
};

export const switchLike = async (postId: number) => {
  const { userId } = auth();
  if (!userId) {
    throw new Error("user is not authenticated");
  }
  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });
    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      await prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to switch like");
  }
};

export const addComment = async (postId: number, desc: string) => {
  const { userId } = auth();
  if (!userId) {
    throw new Error("user is not authenticated");
  }
  try {
    const createdComment = await prisma.comment.create({
      data: {
        postId,
        userId,
        desc,
      },
      include: {
        user: true,
      },
    });
    return createdComment;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to add comment");
  }
};

export const addPost = async (formData: FormData, img: string) => {
  const desc = formData.get("desc") as string;
  const Desc = z.string().min(1).max(255);
  const validatedDesc = Desc.safeParse(desc);

  if (!validatedDesc.success) {
    console.log("desc is invalid");

    return;
  }

  const { userId } = auth();
  if (!userId) {
    throw new Error("user is not authenticated");
  }

  try {
    await prisma.post.create({
      data: {
        desc: validatedDesc.data,
        img,
        userId,
      },
    });
    revalidatePath("/");
  } catch (error) {
    console.log(error);
  }
};

export const addStory = async (img: string) => {
  const { userId } = auth();
  if (!userId) {
    throw new Error("user is not authenticated");
  }

  try {
    // 查找是否已经存在该用户的故事
    const existingStory = await prisma.story.findFirst({
      where: {
        userId,
      },
    });
    // 如果存在，则删除旧的，添加新的
    if (existingStory) {
      await prisma.story.delete({
        where: {
          id: existingStory.id,
        },
      });
    }
    const createdStory = await prisma.story.create({
      data: {
        img,
        userId,
        expiresAt: new Date(Date.now() + 86400000),
      },
      include: {
        user: true,
      },
    });
    return createdStory;
  } catch (error) {
    console.log(error);
  }
};

export const deletePost = async (postId: number) => {
  const { userId } = auth();
  if (!userId) {
    throw new Error("user is not authenticated");
  }

  try {
    await prisma.post.delete({
      where: {
        id: postId,
        userId,
      },
    });
    revalidatePath("/");
  } catch (error) {
    console.log(error);
  }
};
