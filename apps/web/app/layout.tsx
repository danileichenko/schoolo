import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "schoolo — teachers",
  description: "Teacher and admin web for schoolo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
