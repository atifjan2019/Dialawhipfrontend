"use client";

export function DriverLogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }
  return (
    <button
      onClick={logout}
      className="rounded-full border-2 border-yellow px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-yellow transition-colors hover:bg-yellow hover:text-ink"
    >
      Sign out
    </button>
  );
}
