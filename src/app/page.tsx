import { redirect } from "next/navigation";
import { ROUTES } from "@/common/routes";

export default function Home() {
  redirect(ROUTES.NEW_CHAT);
}
