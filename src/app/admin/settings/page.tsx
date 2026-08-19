import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { requireAdminUser } from "@/application/auth/auth-service";
import { AdminSecurityPage } from "@/features/admin/components/admin-security-page";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

export default async function AdminSettingsRoute(): Promise<ReactElement> {
  const repository = createDemoStoreRepository();
  const admin = await requireAdminUser(repository, await readSessionUser());
  if (!admin) redirect("/admin/login");

  return (
    <AdminShell
      description="Keep the administrator account secure by changing its password when needed."
      eyebrow="Account"
      title="Security"
    >
      <AdminSecurityPage />
    </AdminShell>
  );
}
