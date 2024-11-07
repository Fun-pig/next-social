"use client";

import { addStory } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";
import { Story, User } from "@prisma/client";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useOptimistic, useState } from "react";

type StoryWithUser = Story & { user: User };

const StoryList = ({
  stories,
  userId,
}: {
  stories: StoryWithUser[];
  userId: string;
}) => {
  const [storyList, setStoryList] = useState(stories);
  const [img, setImg] = useState<any>();

  const { user, isLoaded } = useUser();

  const [optimisticStories, addOptimisticStories] = useOptimistic(
    storyList,
    (state, newStory: StoryWithUser) => [newStory, ...state]
  );

  const add = async () => {
    if (!img?.secure_url) return;

    addOptimisticStories({
      id: Math.random(),
      img: img.secure_url,
      userId: userId,
      createdAt: new Date(Date.now()),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      user: {
        id: userId,
        name: "",
        username: "Sending...",
        avatar: user?.imageUrl || "/noAvatar.png",
        cover: "",
        description: "",
        surname: "",
        city: "",
        work: "",
        school: "",
        website: "",
        createdAt: new Date(Date.now()),
      },
    });
    try {
      const createdStory = await addStory(img.secure_url);
      setStoryList((prev) => [createdStory!, ...prev]);
      setImg(null);
    } catch (error) {}
  };
  return (
    <>
      {/* PIC UPDATE */}
      <CldUploadWidget
        uploadPreset="social"
        onSuccess={(result, widget) => {
          setImg(result.info);
          widget.close();
        }}
      >
        {({ open }) => (
          <div className="flex flex-col items-center gap-2 cursor-pointer relative">
            <Image
              src={img?.secure_url || user?.imageUrl || "/noAvatar.png"}
              alt=""
              width={80}
              height={80}
              className="w-20 h-20 rounded-full ring-2 object-cover"
              onClick={() => open()}
            />
            {img ? (
              <form action={add}>
                <button className="text-xs bg-blue-500 p-1 rounded-md text-white">
                  Send
                </button>
              </form>
            ) : (
              <span className="font-medium">Add a story</span>
            )}
            <div className="absolute text-6xl text-gray-200 top-1" onClick={() => open()}>+</div>
          </div>
        )}
      </CldUploadWidget>
      {optimisticStories.map((store) => (
        <div
          className="flex flex-col items-center gap-2 cursor-pointer"
          key={store.id}
        >
          <Image
            src={store.user.avatar || "/noAvatar.png"}
            alt=""
            width={80}
            height={80}
            className="w-20 h-20 rounded-full ring-2"
          />
          <span className="font-medium">
            {store.user.name || store.user.username}
          </span>
        </div>
      ))}
    </>
  );
};

export default StoryList;
