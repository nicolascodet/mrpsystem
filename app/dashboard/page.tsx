import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardContent from "./DashboardContent";

export default async function Page() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  return <DashboardContent userName={session.user?.name || "User"} />;
}
