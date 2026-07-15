import { auth } from "@clerk/nextjs/server";
import DiscoveryTest from "@/components/discovery-test";

export default async function DiscoveryPage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  return <DiscoveryTest />;
}
