import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DiscoveryTest from "@/components/discovery-test";

export default async function DiscoverPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return <DiscoveryTest />;
}
