import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function CheckoutRedirectPage() {
  redirect(`/${routing.defaultLocale}/checkout`);
}
