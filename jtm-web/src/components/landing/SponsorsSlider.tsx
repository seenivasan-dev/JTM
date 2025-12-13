"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Sponsor {
  src: string
  name: string
  level: string
}

interface SponsorsSliderProps {
  sponsors: Sponsor[]
}

export function SponsorsSlider({ sponsors }: SponsorsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length)
    }, 3000) // Change sponsor every 3 seconds

    return () => clearInterval(interval)
  }, [sponsors.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + sponsors.length) % sponsors.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sponsors.length)
  }

  const currentSponsor = sponsors[currentIndex]

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Main Sponsor Display */}
      <div className="flex items-center justify-center gap-8">
        {/* Previous Button */}
        <Button
          onClick={goToPrevious}
          size="icon"
          variant="outline"
          className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all border-2 border-blue-200 hover:border-blue-400"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Sponsor Card */}
        <div className="flex-1 max-w-2xl">
          <div className="bg-white rounded-2xl p-12 shadow-2xl border-2 border-blue-100 transform transition-all duration-500 hover:scale-105">
            <div className="relative aspect-[3/2] mb-6">
              <Image
                src={currentSponsor.src}
                alt={currentSponsor.name}
                fill
                className="object-contain"
              />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-gray-900 text-3xl mb-3">{currentSponsor.name}</h3>
              <span className={`text-lg px-6 py-2 rounded-full inline-block ${
                currentSponsor.level === 'Platinum' ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300' :
                currentSponsor.level === 'Gold' ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-300' :
                currentSponsor.level === 'Silver' ? 'bg-gray-200 text-gray-700 ring-2 ring-gray-400' :
                currentSponsor.level === 'Bronze' ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-300' :
                'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
              }`}>
                {currentSponsor.level} Sponsor
              </span>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <Button
          onClick={goToNext}
          size="icon"
          variant="outline"
          className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all border-2 border-blue-200 hover:border-blue-400"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Indicator Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {sponsors.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'w-8 bg-blue-600' 
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to sponsor ${index + 1}`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="text-center mt-4 text-sm text-gray-600">
        {currentIndex + 1} / {sponsors.length}
      </div>
    </div>
  )
}
