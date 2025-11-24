import React from 'react';

export const GridHeader: React.FC = () => {
  return (
    <div className="flex mb-2 text-[10px] md:text-xs text-gray-400 font-mono pl-8 md:pl-10">
        <div className="flex-1 text-left">Week 1</div>
        <div className="flex-1 text-center">Week 26</div>
        <div className="flex-1 text-right pr-2">Week 52</div>
    </div>
  );
};