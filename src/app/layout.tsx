//@ts-ignore
import '@/styles/tailwind.css';

import '@/lib/db';

import { Box, Container, Grid, TabNav, Theme } from '@radix-ui/themes';
import { DBProvider } from './db-provider';
import { Header } from './header';
import { Footer } from './footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CANshark • Solar Gators',
    openGraph: {
        url: 'https://next-enterprise.vercel.app/',
        images: [
            {
                width: 1200,
                height: 630,
                url: 'https://raw.githubusercontent.com/Blazity/next-enterprise/main/.github/assets/project-logo.png',
            },
        ],
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-dvh">
                <DBProvider>
                    <Theme appearance="dark">
                        <Grid mx="auto" columns="1" rows="3rem auto max-content" minHeight="100dvh">
                            <Header />

                            <Box mx="auto" className="w-full max-w-6xl">
                                {children}
                            </Box>

                            <Footer />
                        </Grid>
                    </Theme>
                </DBProvider>
            </body>
        </html>
    );
}
