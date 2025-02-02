import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";

export function SignInButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <Button
        onClick={() => signOut()}
        variant="outline"
        className="bg-white text-gray-900 hover:bg-gray-100"
      >
        Sign Out
      </Button>
    );
  }

  return (
    <Button
      onClick={() => signIn("azure-ad")}
      variant="outline"
      className="bg-white text-gray-900 hover:bg-gray-100 flex items-center gap-2"
    >
      <svg width="21" height="21" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 0L20 3.63V17.38L10 21L0 17.38V3.63L10 0Z" fill="#00A4EF"/>
        <path d="M10 0L20 3.63V17.38L10 21V0Z" fill="#0078D4"/>
        <path d="M10 7.25L15 9.13V14.88L10 16.75L5 14.88V9.13L10 7.25Z" fill="white"/>
      </svg>
      Continue with Microsoft
    </Button>
  );
}
