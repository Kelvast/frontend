export const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";

export function getDevCredentials() {
  if (!DEV_MODE) return null;
  return {
    email: process.env.NEXT_PUBLIC_DEV_EMAIL ?? "dev@mmo.local",
    password: process.env.NEXT_PUBLIC_DEV_PASSWORD ?? "devpass123",
  };
}
