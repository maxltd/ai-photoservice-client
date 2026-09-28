import { redirect } from "next/navigation";

export function buildAuthRedirectPath(returnTo?: string): string {
  const search = new URLSearchParams({ auth: "1" });

  if (returnTo) {
    search.set("next", returnTo);
  }

  return `/?${search.toString()}`;
}

export function redirectToAuth(returnTo?: string): never {
  redirect(buildAuthRedirectPath(returnTo));
}
