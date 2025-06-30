
import type { Metadata } from 'next'
import localFont from "next/font/local";
import "./globals.css";
import { Inter, Dancing_Script, Russo_One, Exo_2 } from "next/font/google";
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--inter",
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: "--dancinscript",
  display: 'swap',
})

const russone = Russo_One({
  subsets: ['latin'],
  variable: "--russone",
  display: 'swap',
  weight: "400",
})

const exo = Exo_2({
  subsets: ['latin'],
  variable: "--exo",
  display: 'swap',
  weight: "400",
})
export const metadata: Metadata = {
  title: 'ChainGate Corporate Dashboard',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dancingScript.variable} ${russone.variable} ${exo.variable}`}>{children}</body>
    </html>
  )
}
