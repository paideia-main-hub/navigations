import type { Metadata } from "next";
import { geistMono, geistSans, plusJakarta } from "@/app/fonts";
import { ThemeInitScript } from "@/ui/theme/ThemeInitScript";
import "./globals.css";

export const metadata: Metadata = {
  title: "Navigations",
  description:
    "Competition Announcements, Registration, Competition Portals, Practice Resources, Results, School & Student Accounts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <head>
        <ThemeInitScript />
      </head>
      <body suppressHydrationWarning className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
