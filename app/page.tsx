import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center p-6"><SignIn forceRedirectUrl="/discovery" signUpUrl="/sign-up" /></main>;
}
