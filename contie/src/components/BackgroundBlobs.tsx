
import React from 'react';

const BackgroundBlobs: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
      {/* Primary Cloud Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob"></div>
      <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-indigo-600 rounded-full mix-blend-screen filter blur-[140px] opacity-15 animate-blob [animation-delay:2s]"></div>
      <div className="absolute bottom-[-15%] left-[10%] w-[55%] h-[55%] bg-fuchsia-600 rounded-full mix-blend-screen filter blur-[160px] opacity-10 animate-blob [animation-delay:4s]"></div>
      <div className="absolute bottom-[5%] right-[0%] w-[40%] h-[40%] bg-violet-800 rounded-full mix-blend-screen filter blur-[130px] opacity-20 animate-blob [animation-delay:1s]"></div>
      
      {/* Subtle Noise/Grain Overlay (Optional but adds texture) */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    </div>
  );
};

export default BackgroundBlobs;
