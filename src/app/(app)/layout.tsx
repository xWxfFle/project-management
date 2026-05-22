import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AppLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b px-6 py-3 dark:border-zinc-700">
        <nav className="flex gap-4 text-sm">
          <Link href="/">BI</Link>
          {session.role === "analyst" && (
            <>
              <Link href="/analyze">Анализ</Link>
              <Link href="/connect">Подключение</Link>
            </>
          )}
          <Link href="/dashboards">Дашборды</Link>
        </nav>
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span>
            {session.email} ({session.role})
          </span>
          <LogoutButton />
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
