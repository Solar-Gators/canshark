'use client';

import { Container, Flex, TabNav, Tabs } from '@radix-ui/themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
    const pathname = usePathname();

    return (
        <div className="sticky top-0 left-0 z-10 border-b border-b-(--gray-a4) bg-(--gray-1)">
            <Flex className="mx-auto max-w-6xl" align="center" justify="start" height="100%" width="100%" asChild>
                <header>
                    <Flex align="end" height="100%" justify="start" pl="3" gapX="6">
                        <Image
                            priority
                            src="/solar-gators.svg"
                            alt="Solar Gators logo"
                            className="h-auto w-20 self-center"
                            width={80}
                            height={40}
                        />

                        <TabNav.Root>
                            <TabNav.Link asChild active={pathname === '/'}>
                                <Link href="/">Capture</Link>
                            </TabNav.Link>

                            <TabNav.Link asChild active={pathname === '/dbc'}>
                                <Link href="/dbc">DBCs</Link>
                            </TabNav.Link>
                        </TabNav.Root>
                    </Flex>
                </header>
            </Flex>
        </div>
    );
}
