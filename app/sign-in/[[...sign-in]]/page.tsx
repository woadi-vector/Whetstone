import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center px-5">
      <SignIn forceRedirectUrl="/discover" signUpUrl="/sign-up" />
    </div>
  );
}
