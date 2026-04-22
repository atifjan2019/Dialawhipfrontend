"use client";

export function DriverLogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }
  return (
    <button onClick={logout} className="font-medium text-butter transition-colors hover:text-cream">
      Sign out
    </button>
  );
}
