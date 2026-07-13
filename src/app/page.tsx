import { redirect } from "next/navigation";

// The root path is protected by middleware. If a user reaches here they are
// authenticated, so forward them to the dashboard.
export default function Home() {
  redirect("/dashboard");
}
