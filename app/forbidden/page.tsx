import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl">🚫</div>
      <h1 className="mt-4 text-3xl font-bold">Access denied</h1>
      <p className="mt-2 text-slate-600">Your account does not have permission to view this page.</p>
      <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-md bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800">Return home</Link>
    </div>
  );
}
