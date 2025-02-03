import { getProviders, signIn } from "next-auth/react";
import Image from "next/image";

export default async function SignIn() {
  const providers = await getProviders();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Sign in to MRP System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in with your Atelier Frames account
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            {providers &&
              Object.values(providers).map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => signIn(provider.id, { callbackUrl: "/" })}
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span>Sign in with {provider.name}</span>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
