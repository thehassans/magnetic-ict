import { redirect } from "next/navigation";

export default function LocalizedAdminOrdersRedirect() {
  redirect("/admin/orders");
}
