'use client';

import { Dithering } from '@paper-design/shaders-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function AuthShader() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-full h-full bg-muted" />;
    }

    const isDarkMode = resolvedTheme === 'dark';

    return (
        <div className="w-full h-full relative overflow-hidden rounded-3xl">
            <Dithering
                style={{ height: '100%', width: '100%' }}
                colorBack={isDarkMode ? '#000000' : '#ffffff'}
                colorFront={isDarkMode ? '#10b981' : '#34d399'} // Emerald-500 / Emerald-400
                shape="warp"
                type="4x4"
                pxSize={4}
                offsetX={0}
                offsetY={0}
                scale={1.5}
                rotation={0}
                speed={0.05}
            />
        </div>
    );
}
