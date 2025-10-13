import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { Children, useState } from 'react';

type CarouselProps = {
  children: ReactNode;
}

export default function Carousel({
  children
}: CarouselProps) {

  const [curr, setCurr] = useState(0);
  const slides = Children.toArray(children);

  const prev = () =>
    setCurr((curr) => (curr === 0 ? slides.length - 1 : curr - 1));

  const next = () =>
    setCurr((curr) => (curr === slides.length - 1 ? 0 : curr + 1));



  return (
    <div className='overflow-hidden relative'>
      <div
        className='flex transition-transform ease-out duration-500'
        style={{ transform: `translateX(-${curr * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="w-full min-w-full flex-shrink-0">
            {slide}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className='absolute inset-0 flex items-center justify-between p-4'>
        <button onClick={prev} className='p-1 rounded-full shadow bg-white/80 text-gray-800 hover:bg-white'>
          <ChevronLeft size={40} />
        </button>
        <button onClick={next} className='p-1 rounded-full shadow bg-white/80 text-gray-800 hover:bg-white'>
          <ChevronRight size={40} />
        </button>
      </div>

      {/* Navigation Dots */}
      <div className='absolute bottom-4 right-0 left-0'>
        <div className='flex items-center justify-center gap-2'>
          {slides.map((_, i) => (
            <div
              key={i}
              className={`
                transition-all w-3 h-3 bg-white rounded-full
                ${curr === i ? "p-2" : "bg-opacity-50"}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
}