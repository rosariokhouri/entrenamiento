import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation, DesktopNavigation } from "@/components/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gym Tracker - Tu Compañero de Entrenamiento",
  description:
    "Aplicación completa para seguimiento de entrenamientos, progreso y análisis de rendimiento en el gimnasio.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-background">
            <DesktopNavigation />
            <main className="md:ml-64 pb-16 md:pb-0">{children}</main>
            <Navigation />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
