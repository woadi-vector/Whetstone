import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <div className="flex min-h-[calc(100vh-76px)] items-center justify-center px-5"><SignUp forceRedirectUrl="/discover" signInUrl="/sign-in" /></div>;
}
