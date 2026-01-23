import React from 'react';

const DynamicBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div className="absolute inset-0 bg-slate-200"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-slate-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute top-[40%] left-[40%] w-96 h-96 bg-zinc-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>
  );
};

export default DynamicBackground;
