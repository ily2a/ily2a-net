'use client';

import dynamic from 'next/dynamic';

const NotFoundPasswordWaves = dynamic(() => import('@/components/backgrounds/NotFoundPasswordWaves'), { ssr: false });

export default function NotFoundPasswordBg() {
  return (
    <div className="absolute inset-0 -z-10 opacity-60">
      <NotFoundPasswordWaves
        brightness={0.18}
        speed={0.25}
        warpIntensity={0.9}
        rotation={-45}
        colorCycleSpeed={0.8}
      />
    </div>
  );
}
