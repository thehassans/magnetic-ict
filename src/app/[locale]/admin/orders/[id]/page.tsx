import { redirect } from "next/navigation";

export default async function LocalizedAdminOrderDetailRedirect({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  redirect(`/admin/orders/${id}`);
}
