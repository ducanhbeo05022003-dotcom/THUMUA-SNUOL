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
        {user && <Sidebar user={user} />}
        <main className={user ? "ml-56 min-h-screen bg-slate-50" : ""}>
          {children}
        </main>
      </body>
    </html>
  );
}
