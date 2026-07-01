import { redirect } from "next/navigation";

export default function AdminSignupRedirect() {
  redirect("/signup");
}
