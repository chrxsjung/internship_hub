import ToolCard from "@/components/ToolCard";
import ToolCardComingSoon from "@/components/ToolCardComingSoon";

export default function Home() {
  return (
    <main className="p-6 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-5xl font-bold text-center">
        Tools for SWE Internships :)
      </h1>
      <p className="mt-5 text-xl text-center lg:max-w-lg">
        Here are some tools I think are useful for internship seekers like me
        and you! I will keep adding more as I go. Feel free to suggest new tools
        too! - Chris
      </p>

      <div className="mt-16 flex gap-6 flex-row flex-wrap justify-center">
        <ToolCard
          link="resume/new"
          title="Resume Optimization"
          description="See how well your resume is optimized for ATS and in general. Get immediate suggestions to improve it."
        />
        <ToolCard
          link="ideas/new"
          title="Project Ideas Generator"
          description="Generate new project ideas to enhance your portfolio. Filters like languages, niche, time commitment, are available!"
        />
        <ToolCard
          link="/cover-letter"
          title="Cover Letter Generator"
          description="Generate a bomb cover letter to build upon based on your resume and the job description."
        />
        <ToolCardComingSoon
          link="ideas/new"
          title="Company Specific Interview Qs"
          description="Company specific interview questions to help you prepare effectively. Idk if this is possible but we ball "
        />
      </div>

      <div className="mt-16 text-center text-green-300 text-3xl">
        CLIKC DIS:{" "}
        <a
          href="http://chrxsjung.me"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          chrxsjung.me
        </a>
      </div>
    </main>
  );
}
