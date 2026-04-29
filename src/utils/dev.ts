import { NEXT_PUBLIC_DEV_MODE, NEXT_PUBLIC_DEV_EMAIL, NEXT_PUBLIC_DEV_PASSWORD } from "../config";

export const DEV_MODE = NEXT_PUBLIC_DEV_MODE;

export function getDevCredentials() {
  if (!DEV_MODE) return null;
  return {
    email: NEXT_PUBLIC_DEV_EMAIL,
    password: NEXT_PUBLIC_DEV_PASSWORD,
  };
}
