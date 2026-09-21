import { subscribeUserData } from "../utils/fetch/fetchUser";
import type { UserDoc } from "../../shared/types/firestore";

let unsubscribeUserData: ReturnType<typeof subscribeUserData> | null = null;

export const startUserDataSubscription = (
  uid: string,
  onChange: (data: UserDoc | undefined) => void,
) => {
  unsubscribeUserData = subscribeUserData(uid, onChange);
};

export const stopUserDataSubscription = () => {
  if (unsubscribeUserData) unsubscribeUserData();
};
