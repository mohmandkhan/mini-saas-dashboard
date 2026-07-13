import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Dashboard } from "@/components/Dashboard";

export const metadata = { title: "Projects · Mini SaaS Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <Dashboard user={{ id: user.sub, email: user.email, name: user.name }} />;
}
