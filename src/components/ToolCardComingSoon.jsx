export default function ToolCardComingSoon({ link, title, description }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition flex flex-col h-80">
      <div className="flex-1">
        <h3 className="text-lg font-semibold mt-8 text-center text-black">
          {title}
        </h3>
        <p className="mt-8 text-sm text-gray-600 text-center w-64">
          {description}
        </p>
      </div>
      <div className="mt-auto">
        <a className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition block text-center cursor-not-allowed">
          Coming Soon
        </a>
      </div>
    </div>
  );
}
