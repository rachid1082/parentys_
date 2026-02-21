export const metadata = {
  title: "Parentys Clean Starter",
  description: "Clean Next.js base project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
