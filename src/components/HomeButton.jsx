import Link from "next/link";

export default function HomeButton() {
  return (
    <div className="absolute top-4 right-4">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 transition"
      >
        Home
      </Link>
    </div>
  );
}
