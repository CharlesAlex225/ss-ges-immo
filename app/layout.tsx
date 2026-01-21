import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext"; // <--- Import this

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SS Ges Imm",
  description: "Maintenance Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>  {/* <--- Wrap everything */}
           {children}
        </AuthProvider>
      </body>
    </html>
  );
}