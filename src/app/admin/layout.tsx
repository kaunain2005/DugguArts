import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cryptographically verifies Firebase __session cookie using Firebase Admin SDK and validates ADMIN_EMAILS
  const adminSession = await requireAdminSession();

  if (!adminSession?.user?.isAdmin) {
    redirect("/?error=unauthorized");
  }

  return (
    <div className="admin-layout min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={adminSession.user} />
        <main className="admin-main flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
