import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* title is handled by metadata */}
        {/* description is handled by metadata */}
        {/* viewport is handled by viewport export */}
        {/* theme-color is handled by viewport export */}
        {/* manifest is handled by metadata */}
        <link rel="icon" href="/festival-logo.png" />
        <link rel="apple-touch-icon" href="/festival-logo.png" />
        {/* apple-mobile-web-app-capable is handled by metadata */}
        {/* apple-mobile-web-app-status-bar-style is handled by metadata */}
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

const APP_NAME = "Festva";
const APP_DEFAULT_TITLE = "大港開唱 2025 - Festva";
const APP_TITLE_TEMPLATE = "%s - " + APP_NAME;
const APP_DESCRIPTION = "大港開唱 2025 非官方演出資訊排程小工具";

export const metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black',
    title: 'Festva'
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },  
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false
};
