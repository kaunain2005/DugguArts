import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email: string): boolean {
  if (!adminEmails.length) return false;
  return adminEmails.includes(email.toLowerCase());
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Double-check admin authorization (middleware handles auth, this handles admin role)
  const userEmail = session?.user?.email?.toLowerCase() || "";

  if (!session?.user?.email || (adminEmails.length > 0 && !adminEmails.includes(userEmail))) {
    // Redirect to home with error
    redirect("/?error=unauthorized");
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