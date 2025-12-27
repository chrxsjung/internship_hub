import Link from "next/link";

export default function ProjectIdeaButton() {
  return (
    <div className="absolute top-4 right-24">
      <Link
        href="/ideas/new"
        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 transition"
      >
        Try it Yourself
      </Link>
    </div>
  );
}
