'use client';

import dynamic from 'next/dynamic';

const LineWaves = dynamic(() => import('@/components/LineWaves'), { ssr: false });

export default function LineWavesBackground() {
  return (
    <div className="absolute inset-0 -z-10 opacity-60">
      <LineWaves
        brightness={0.18}
        speed={0.25}
        warpIntensity={0.9}
        rotation={-45}
        colorCycleSpeed={0.8}
      />
    </div>
  );
}
