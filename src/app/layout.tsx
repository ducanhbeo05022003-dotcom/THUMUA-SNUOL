import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { getSession } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "QLMH - Quản lý mua hàng",
  description: "Hệ thống quản lý mua hàng",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  return (
    <html lang="vi">
      <body className="font-sans text-slate-800 antialiased">
        {user ? (
          <div className="min-h-screen p-2 sm:p-3">
            <div className="flex min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-1.5rem)] rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5">
              <Sidebar user={user} />
              <main className="flex-1 min-w-0 bg-slate-50/90 backdrop-blur-sm overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  );
}
