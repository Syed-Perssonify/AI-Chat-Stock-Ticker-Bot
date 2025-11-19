import { redirect } from "next/navigation";
import { routes } from "@/common/config/routes";

export default function Home() {
  redirect(routes.NEW_CHAT);
}
