import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{ background: "#f5f5f0", minHeight: "100vh" }}
      className="flex items-center justify-center p-6"
    >
      <div className="text-center max-w-md">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "linear-gradient(135deg, #b91c1c, #7f1d1d)" }}
        >
          <span className="text-white text-3xl font-black">CM</span>
        </div>
        <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
        <p className="text-xl font-semibold text-gray-700 mb-2">Page not found</p>
        <p className="text-sm text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all"
          style={{ background: "linear-gradient(135deg, #b91c1c, #7f1d1d)" }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
