"use client";

import { acceptFollowRequest, declineFollowRequest } from "@/lib/actions";
import { FollowerRequest, User } from "@prisma/client";
import Image from "next/image";
import { useOptimistic, useState } from "react";

type RequestWithUser = FollowerRequest & { sender: User };
export default function FriendRequestList({
  requests,
}: {
  requests: RequestWithUser[];
}) {
  const [requestState, setRequestState] = useState(requests);

  const accept = async (requestId: number, userId: string) => {
    removeOptimisticRequest(requestId);
    try {
      await acceptFollowRequest(userId);
      setRequestState((pre) => pre.filter((req) => req.id !== requestId));
    } catch (error) {}
  };

  const decline = async (requestId: number, userId: string) => {
    removeOptimisticRequest(requestId);
    try {
      await declineFollowRequest(userId);
      setRequestState((pre) => pre.filter((req) => req.id !== requestId));
    } catch (error) {}
  };

  const [optimisticRequests, removeOptimisticRequest] = useOptimistic(
    requestState,
    (state, value: number) => state.filter((req) => req.id !== value)
  );
  return (
    <div className="flex flex-col gap-4">
      {optimisticRequests.map((item) => (
        <div className="flex items-center justify-between" key={item.id}>
          <div className="flex items-center gap-4">
            <Image
              src={item.sender.avatar || "/noAvatar.png"}
              alt=""
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="font-semibold">
              {item.sender.name && item.sender.surname
                ? item.sender.name + " " + item.sender.username
                : item.sender.username}
            </span>
          </div>
          <div className="flex gap-3 justify-end">
            <form action={() => accept(item.id, item.sender.id)}>
              <button>
                <Image
                  src="/accept.png"
                  alt=""
                  width={20}
                  height={20}
                  className="cursor-pointer"
                />
              </button>
            </form>
            <form action={() => decline(item.id, item.sender.id)}>
              <button>
                <Image
                  src="/reject.png"
                  alt=""
                  width={20}
                  height={20}
                  className="cursor-pointer"
                />
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
