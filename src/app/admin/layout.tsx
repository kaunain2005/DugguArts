import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Double-check admin authorization (middleware handles auth, this handles admin role)
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  const userEmail = session?.user?.email?.toLowerCase() || "";

  if (!session?.user?.email || (adminEmails.length > 0 && !adminEmails.includes(userEmail))) {
    // This should not happen due to middleware, but safety check
    return null;
  }

  return (
    <div className="admin-layout min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={session.user} />
        <main className="admin-main flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}