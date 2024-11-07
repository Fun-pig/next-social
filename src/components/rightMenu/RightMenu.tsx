import FriendRequests from "./FriendRequests";
import Birthdays from "./Birthdays";
import Ad from "../Ad";
import UserInfoCard from "./UserInfoCard";
import UserMediaCard from "./UserMediaCard";
import { User } from "@prisma/client";
import { Suspense } from "react";

export default function RightMenu({ user }: { user?: User }) {
  return (
    <div className="flex flex-col gap-6">
      {user ? (
        <>
          <Suspense fallback="Loading...">
            <UserInfoCard user={user} />
          </Suspense>
          <Suspense fallback="Loading...">
            <UserMediaCard user={user} />
          </Suspense>
        </>
      ) : null}
      <FriendRequests />
      <Birthdays />
      <Ad size="md" />
    </div>
  );
}
