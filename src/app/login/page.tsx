import { redirect } from "next/navigation";

/** Authentication is intentionally disabled for this demo deployment. */
export default function LoginPage() {
  redirect("/dashboard");
}
