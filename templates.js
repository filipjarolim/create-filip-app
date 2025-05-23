/**
 * File Template Contents
 * 
 * This file contains all the template strings for file contents used
 * when creating a new project.
 */

// Basic Next.js Templates
export const pageContent = (projectName) => `"use client"

import Link from 'next/link'
import { ArrowRight, Github, Star, GitFork } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero section */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-b">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Welcome to your new project
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">${projectName}</h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed">
                A modern Next.js application with Tailwind CSS and shadcn/ui components
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild>
                <Link href="/docs">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://github.com/filiphric/create-filip-app" target="_blank">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Link>
              </Button>
              <div className="flex items-center">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Features</h2>
            <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed">
              This project comes with everything you need to build a modern web application
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Next.js 15</CardTitle>
                <CardDescription>App Router & React Server Components</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Built with the latest Next.js features including server components and the app router</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="https://nextjs.org/docs" target="_blank">Learn more</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tailwind CSS</CardTitle>
                <CardDescription>Utility-first CSS framework</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Style your application with the highly customizable and performance-focused CSS framework</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="https://tailwindcss.com/docs" target="_blank">Learn more</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>shadcn/ui</CardTitle>
                <CardDescription>Accessible component library</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Beautiful, accessible, and customizable components that you can copy and paste into your apps</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="https://ui.shadcn.com" target="_blank">Learn more</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready for Production</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  Everything you need to build your next project with the best developer experience
                </p>
              </div>
            </div>
            <div className="grid gap-6 lg:col-span-2 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">Fast Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">100%</div>
                  <p className="text-xs text-muted-foreground">Optimized for developer experience</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">50+</div>
                  <p className="text-xs text-muted-foreground">Reusable UI components</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}`;

export const layoutContent = `import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Filip App",
  description: "A modern Next.js application template with all the best practices",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        {children}
      </body>
    </html>
  );
}`;

export const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig`;

export const tsConfigContent = `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`;

export const tailwindConfigContent = `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`;

export const postcssConfigContent = `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;`;

export const globalCssContent = `@import 'tailwindcss';

@plugin 'tailwindcss-animate';

@custom-variant dark (&:is(.dark *));
:root {
  --radix-accordion-content-height: 100px; /* Define the custom property with a default value */
}

[data-scroll-locked][data-scroll-locked] {
  overflow-y: scroll !important;
}


@theme {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));

  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));

  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));

  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));

  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));

  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));

  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));

  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));

  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));

  --color-chart-1: hsl(var(--chart-1));
  --color-chart-2: hsl(var(--chart-2));
  --color-chart-3: hsl(var(--chart-3));
  --color-chart-4: hsl(var(--chart-4));
  --color-chart-5: hsl(var(--chart-5));

  --color-sidebar: hsl(var(--sidebar-background));
  --color-sidebar-foreground: hsl(var(--sidebar-foreground));
  --color-sidebar-primary: hsl(var(--sidebar-primary));
  --color-sidebar-primary-foreground: hsl(var(--sidebar-primary-foreground));
  --color-sidebar-accent: hsl(var(--sidebar-accent));
  --color-sidebar-accent-foreground: hsl(var(--sidebar-accent-foreground));
  --color-sidebar-border: hsl(var(--sidebar-border));
  --color-sidebar-ring: hsl(var(--sidebar-ring));

  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);

  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
  --animate-fade-in: fadeIn 0.8s ease-out forwards;
  --animate-slide-up: slideUp 0.5s ease-out forwards;
  --animate-slide-down: slideDown 0.5s ease-out forwards;

  @keyframes accordion-down {
    from {
      height: 0;
    }
    to {
      height: var(--radix-accordion-content-height);
    }
  }
  @keyframes accordion-up {
    from {
      height: var(--radix-accordion-content-height);
    }
    to {
      height: 0;
    }
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  @keyframes slideDown {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100%);
      opacity: 0;
    }
  }
}

/*
  The default border color has changed to \`currentColor\` in Tailwind CSS v4,
  so we've added these compatibility styles to make sure everything still
  looks the same as it did with Tailwind CSS v3.

  If we ever want to remove these styles, we need to add an explicit border
  color utility to any element that depends on these defaults.
*/
@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentColor);
  }
}

@layer utilities {
  body {
    font-family: Arial, Helvetica, sans-serif;
  }
  
  .animate-fadeIn {
    animation: var(--animate-fade-in);
  }
  
  .animate-slideUp {
    animation: slideUp 0.5s ease-out forwards;
  }
  
  .animate-slideDown {
    animation: slideDown 0.5s ease-out forwards;
  }
  
  .animation-delay-300 {
    animation-delay: 300ms;
  }
  
  .animation-delay-600 {
    animation-delay: 600ms;
  }
  
  .animation-delay-900 {
    animation-delay: 900ms;
  }
  
  .animation-delay-1200 {
    animation-delay: 1200ms;
  }
  
  .animation-delay-1500 {
    animation-delay: 1500ms;
  }
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

body {
  overflow-x: hidden;
}

.hamburger {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 12px; /* Adjusted height for two lines */
  width: 24px;
  z-index:10;
}

.hamburger span {
  display: block;
  height: 3px;
  width: 100%;
  border-radius: 3px;
  background-color: #000;
  opacity: 70%;
}

.hamburger.open span:nth-child(1) {
  transform: translateY(5px) rotate(45deg);
}

.hamburger.open span:nth-child(2) {
  transform: translateY(-5px) rotate(-45deg);
}

/* Create a smooth scroll with offset for anchor links */
html {
  scroll-behavior: smooth;
  scroll-padding-bottom: 200px; /* Adjust based on your footer height */
}

/* Footer gradient animation */
@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.footer-gradient {
  background: linear-gradient(90deg, #fbbf24, #f87171, #fbbf24);
  background-size: 200% 200%;
  animation: gradientFlow 15s ease infinite;
}`;

// Utils Template
export const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;

// README Template
export const readmeContent = (appName) => `# ${appName}

This project was created with [create-filip-app](https://github.com/filiphric/create-filip-app).

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
`;

// Theme Provider Template
export const themeProviderContent = `"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

export function ThemeProvider({ 
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
    >
      {children}
    </NextThemesProvider>
  );
}`;

// Theme Toggle Template
export const themeToggleContent = `"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}`;

// Tailwind Config Template
export const configContent = `import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config;`;

// Demo Page Template
export const demoPageContent = `"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DemoPage() {
  return (
    <div className="flex h-screen w-full flex-col">
      <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
        <h2 className="text-lg font-semibold">shadcn/ui</h2>
        <div className="ml-auto flex w-full space-x-2 sm:justify-end">
          <div className="hidden space-x-2 md:flex">
            <ThemeToggle />
          </div>
          <Button>Upgrade</Button>
        </div>
      </div>
      <div className="container grid flex-1 items-start gap-4 pb-10 pt-6 md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="search">Search documentation</Label>
            <Input id="search" placeholder="Search..." />
          </div>
          <div className="grid gap-2">
            <Label>Categories</Label>
            <div className="grid grid-flow-row auto-rows-max text-sm">
              <div className="flex items-center rounded-lg px-3 py-2 bg-muted text-foreground">
                Getting Started
              </div>
              <div className="flex items-center rounded-lg px-3 py-2 hover:bg-transparent hover:text-foreground hover:underline">
                Components
              </div>
              <div className="flex items-center rounded-lg px-3 py-2 hover:bg-transparent hover:text-foreground hover:underline">
                Authentication
              </div>
              <div className="flex items-center rounded-lg px-3 py-2 hover:bg-transparent hover:text-foreground hover:underline">
                Theming
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Welcome
              </h2>
              <p className="text-sm text-muted-foreground">
                A demo of the shadcn/ui components.
              </p>
            </div>
          </div>
          <Tabs defaultValue="account" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>
                    Make changes to your account here. Click save when you're done.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="Pedro Duarte" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue="@peduarte" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Change your password here. After saving, you'll be logged out.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="current">Current password</Label>
                    <Input id="current" type="password" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new">New password</Label>
                    <Input id="new" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save password</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}`;

// Media Query Hook Template
export const useMediaQueryContent = `"use client";

import { useEffect, useState } from "react";
import { breakpoints } from "./breakpoints";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    mediaQuery.addEventListener("change", listener);
    
    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, [query]);
  
  return matches;
}

export function useBreakpoint(breakpoint: keyof typeof breakpoints): boolean {
  return useMediaQuery(\`(min-width: \${breakpoints[breakpoint]})\`);
}`;

// Breakpoints Template
export const breakpointsContent = `// Tailwind breakpoints for use with useMediaQuery hook
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};`;

// Responsive Container Template
export const responsiveContainerContent = `"use client";

import { useBreakpoint } from "@/hooks/use-media-query";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  // When true, shows the children at the specified breakpoint and larger
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
  // When true, shows the children at the specified breakpoint and smaller
  smDown?: boolean;
  mdDown?: boolean;
  lgDown?: boolean;
  xlDown?: boolean;
}

export function ResponsiveContainer({
  children,
  sm,
  md,
  lg,
  xl,
  smDown,
  mdDown,
  lgDown,
  xlDown,
}: ResponsiveContainerProps) {
  const isSm = useBreakpoint("sm");
  const isMd = useBreakpoint("md");
  const isLg = useBreakpoint("lg");
  const isXl = useBreakpoint("xl");

  // For "and larger" breakpoints
  if (sm && !isSm) return null;
  if (md && !isMd) return null;
  if (lg && !isLg) return null;
  if (xl && !isXl) return null;

  // For "and smaller" breakpoints
  if (smDown && isMd) return null;
  if (mdDown && isLg) return null;
  if (lgDown && isXl) return null;
  if (xlDown && isXl) return null; // This is a placeholder since there's no 2xl check

  return <>{children}</>;
}`;

// Responsive Example Template
export const responsiveExampleContent = `"use client";

import { ResponsiveContainer } from "@/components/responsive-container";

export default function ResponsiveExample() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-10 text-3xl font-bold">Responsive Components Example</h1>
      
      <div className="grid w-full max-w-3xl gap-8">
        <div className="rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Responsive Content</h2>
          
          <ResponsiveContainer smDown>
            <div className="rounded-md bg-red-100 p-4 dark:bg-red-900">
              <p className="font-medium">This is only visible on small screens and below</p>
            </div>
          </ResponsiveContainer>
          
          <ResponsiveContainer mdDown>
            <div className="mt-4 rounded-md bg-yellow-100 p-4 dark:bg-yellow-900">
              <p className="font-medium">This is only visible on medium screens and below</p>
            </div>
          </ResponsiveContainer>
          
          <ResponsiveContainer md>
            <div className="mt-4 rounded-md bg-green-100 p-4 dark:bg-green-900">
              <p className="font-medium">This is only visible on medium screens and above</p>
            </div>
          </ResponsiveContainer>
          
          <ResponsiveContainer lg>
            <div className="mt-4 rounded-md bg-blue-100 p-4 dark:bg-blue-900">
              <p className="font-medium">This is only visible on large screens and above</p>
            </div>
          </ResponsiveContainer>
          
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-md bg-purple-100 p-4 dark:bg-purple-900">
              <p className="font-medium">Responsive grid item 1</p>
            </div>
            <div className="rounded-md bg-purple-100 p-4 dark:bg-purple-900">
              <p className="font-medium">Responsive grid item 2</p>
            </div>
            <div className="rounded-md bg-purple-100 p-4 dark:bg-purple-900">
              <p className="font-medium">Responsive grid item 3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`;

// Page Layout Template
export const pageLayoutContent = `"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function PageLayout({
  children,
  title = "Page Title",
  description,
}: PageLayoutProps) {
  const navigation = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Docs", href: "/docs" },
    { name: "About", href: "/about" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold inline-block">{title}</span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-sm font-medium transition-colors hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {description && (
          <div className="border-b py-4">
            <div className="container">
              <p className="text-muted-foreground">{description}</p>
            </div>
          </div>
        )}
        {children}
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/cookies" className="hover:underline">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}`;

// Components Showcase Page Template
export const componentsShowcasePage = `"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

// Custom Components
import { FileUploader } from "@/components/file-uploader"
import { VideoPlayer } from "@/components/video-player"
import { Timeline } from "@/components/timeline"
import { Rating } from "@/components/rating"
import { FileTree } from "@/components/file-tree"
import { CopyButton } from "@/components/copy-button"

export default function ComponentsShowcase() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  
  // Sample data for demo components
  const timelineItems = [
    {
      id: "step-1",
      title: "Step 1: Plan",
      content: "Create a project plan and gather requirements",
      date: "Jan 1, 2023",
      status: "past"
    },
    {
      id: "step-2",
      title: "Step 2: Design",
      content: "Design the user interface and system architecture",
      date: "Feb 15, 2023",
      status: "past"
    },
    {
      id: "step-3",
      title: "Step 3: Develop",
      content: "Implement the features and functionality",
      date: "March 20, 2023",
      status: "current"
    },
    {
      id: "step-4",
      title: "Step 4: Test & Deploy",
      content: "Test the application and deploy to production",
      date: "April 30, 2023",
      status: "future"
    }
  ]
  
  const fileTreeData = [
    {
      id: "root",
      name: "Project Root",
      type: "folder",
      children: [
        {
          id: "src",
          name: "src",
          type: "folder",
          children: [
            {
              id: "app",
              name: "app",
              type: "folder",
              children: [
                { id: "page", name: "page.tsx", type: "file" },
                { id: "layout", name: "layout.tsx", type: "file" }
              ]
            },
            {
              id: "components",
              name: "components",
              type: "folder",
              children: [
                { id: "button", name: "button.tsx", type: "file" },
                { id: "card", name: "card.tsx", type: "file" }
              ]
            }
          ]
        },
        { id: "package", name: "package.json", type: "file" },
        { id: "tsconfig", name: "tsconfig.json", type: "file" }
      ]
    }
  ]

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-xl font-bold">Components Showcase</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="https://github.com/filiphric/create-filip-app" target="_blank">
              <Button variant="outline" size="sm">GitHub</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-6 md:py-10">
        <div className="flex flex-col gap-4">
          <section className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Component Showcase</h2>
            <p className="text-muted-foreground">
              This page demonstrates all UI and custom components available in your new project.
              Components are organized by category for easy reference.
            </p>
          </section>

          <Tabs defaultValue="ui" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="ui">UI Components</TabsTrigger>
              <TabsTrigger value="custom">Custom Components</TabsTrigger>
            </TabsList>
            
            {/* UI Components Tab */}
            <TabsContent value="ui" className="space-y-10">
              {/* Interactive Components Section */}
              <section className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold">Interactive Components</h3>
                  <p className="text-muted-foreground">Components that handle user interactions and actions</p>
                </div>
                <Separator />
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Button Component */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Button</CardTitle>
                      <CardDescription>Interactive button component with variants</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Button>Default</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm">Small</Button>
                        <Button size="default">Default</Button>
                        <Button size="lg">Large</Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dialog Component */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Dialog</CardTitle>
                      <CardDescription>Modal dialog for user interactions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>Open Dialog</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Dialog Title</DialogTitle>
                            <DialogDescription>
                              This is a dialog component for modal interactions.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <p>Dialog content goes here.</p>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={() => setIsDialogOpen(false)}>Continue</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>

                  {/* Dropdown Menu Component */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Dropdown Menu</CardTitle>
                      <CardDescription>Menu with dropdown options</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            Open Menu <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Profile</DropdownMenuItem>
                          <DropdownMenuItem>Settings</DropdownMenuItem>
                          <DropdownMenuItem>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>

                  {/* Tooltip Component */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Tooltip</CardTitle>
                      <CardDescription>Informational tooltip on hover</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline">Hover Me</Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This is a tooltip that appears on hover</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Layout Components Section */}
              <section className="space-y-6 pt-4">
                <div>
                  <h3 className="text-2xl font-bold">Layout Components</h3>
                  <p className="text-muted-foreground">Components for organizing and structuring content</p>
                </div>
                <Separator />
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Card Component */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Card</CardTitle>
                      <CardDescription>Content container with sections</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>This is the card content section where the main content is displayed.</p>
                    </CardContent>
                    <CardFooter>
                      <p className="text-sm text-muted-foreground">Last updated: Today</p>
                    </CardFooter>
                  </Card>

                  {/* Accordion Component */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Accordion</CardTitle>
                      <CardDescription>Collapsible content sections</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger>Section 1</AccordionTrigger>
                          <AccordionContent>
                            Content for section 1 goes here. This content is only visible when expanded.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger>Section 2</AccordionTrigger>
                          <AccordionContent>
                            Content for section 2 goes here. Expand and collapse to see content.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>

                  {/* Tabs Component */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Tabs</CardTitle>
                      <CardDescription>Tabbed interface for content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="tab1" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                        </TabsList>
                        <TabsContent value="tab1" className="p-4">
                          Content for tab 1
                        </TabsContent>
                        <TabsContent value="tab2" className="p-4">
                          Content for tab 2
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Form Components Section */}
              <section className="space-y-6 pt-4">
                <div>
                  <h3 className="text-2xl font-bold">Form Components</h3>
                  <p className="text-muted-foreground">Components for user input and form creation</p>
                </div>
                <Separator />
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Input Component */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Input</CardTitle>
                      <CardDescription>Text input field</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="default-input">Default Input</Label>
                        <Input id="default-input" placeholder="Enter text here..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="disabled-input">Disabled Input</Label>
                        <Input id="disabled-input" placeholder="Disabled input" disabled />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </TabsContent>
            
            {/* Custom Components Tab */}
            <TabsContent value="custom" className="space-y-10">
              <section className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold">Custom Components</h3>
                  <p className="text-muted-foreground">Specialized components built for specific use cases</p>
                </div>
                <Separator />
                
                <div className="grid gap-6 md:grid-cols-2">
                  {/* File Uploader Component */}
                  <Card>
                    <CardHeader>
                      <CardTitle>File Uploader</CardTitle>
                      <CardDescription>Drag & drop file uploading</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FileUploader 
                        maxFiles={3} 
                        maxSize={5 * 1024 * 1024} 
                        onFilesChange={(files) => console.log(files)}
                      />
                    </CardContent>
                  </Card>

                  {/* Video Player Component */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Video Player</CardTitle>
                      <CardDescription>Custom video player interface</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <VideoPlayer
                        src="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
                        poster="https://sample-videos.com/img/Sample-jpg-image-50kb.jpg"
                        title="Big Buck Bunny"
                      />
                    </CardContent>
                  </Card>

                  {/* Timeline Component */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Timeline</CardTitle>
                      <CardDescription>Vertical progress timeline</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Timeline items={timelineItems} />
                    </CardContent>
                  </Card>

                  {/* Rating Component */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Rating</CardTitle>
                      <CardDescription>Star rating input component</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Read-only Rating</Label>
                        <Rating value={4} readonly />
                      </div>
                      <div className="space-y-2">
                        <Label>Interactive Rating</Label>
                        <Rating value={2} onChange={(value) => console.log(value)} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* File Tree Component */}
                  <Card>
                    <CardHeader>
                      <CardTitle>File Tree</CardTitle>
                      <CardDescription>Interactive file system explorer</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FileTree 
                        data={fileTreeData} 
                        onSelect={(node) => console.log("Selected:", node.name)}
                      />
                    </CardContent>
                  </Card>

                  {/* Copy Button Component */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Copy Button</CardTitle>
                      <CardDescription>One-click text copying</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <code className="text-sm">npm install @/components</code>
                        <CopyButton value="npm install @/components" />
                      </div>
                      <div className="flex items-center gap-2">
                        <CopyButton 
                          value="Text with label" 
                          variant="default" 
                          size="default" 
                          label="Copy Text" 
                          successLabel="Copied!" 
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}`; 