import "./globals.css";

export const metadata = {
  title: "Internship Hub",
  description: "Everything you need to land a SWE Internship!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-white">{children}</body>
    </html>
  );
}
