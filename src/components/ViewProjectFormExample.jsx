import Link from "next/link";

export default function ViewProjectFormExample() {
  return (
    <div className="absolute top-4 right-24">
      <Link
        href="/ideas/example"
        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 transition"
      >
        View Example Form
      </Link>
    </div>
  );
}
