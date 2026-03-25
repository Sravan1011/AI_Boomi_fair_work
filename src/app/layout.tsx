import dynamic from "next/dynamic";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
    variable: "--font-jakarta",
    display: "swap",
});

// Import Providers with SSR disabled to prevent hydration errors
const Providers = dynamic(
    () => import("@/components/Providers").then((mod) => ({ default: mod.Providers })),
    { ssr: false }
);

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${jakartaSans.variable} font-sans`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
