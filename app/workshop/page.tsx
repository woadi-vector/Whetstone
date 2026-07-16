import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import WorkshopTest from "@/components/workshop-test";

export default async function WorkshopPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <WorkshopTest />;
}
