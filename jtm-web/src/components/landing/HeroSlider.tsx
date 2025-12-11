"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Card } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Calendar } from "lucide-react"

interface HeroSlide {
  image?: string
  title: string
  description: string
}

const heroSlides: HeroSlide[] = [
  {
    title: "Pongal Celebration 2024",
    description: "Community gathering celebrating harvest festival with traditional rituals",
  },
  {
    title: "Tamil New Year Festival",
    description: "Welcoming the new year with cultural programs and community feast",
  },
  {
    title: "Deepavali Celebrations",
    description: "Festival of lights celebrated with fireworks and traditional sweets",
  },
  {
    title: "Cultural Dance Performance",
    description: "Bharatanatyam and folk dance performances by community members",
  },
]

export function HeroSlider() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {heroSlides.map((slide, index) => (
          <CarouselItem key={index}>
            <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-gradient-to-br from-orange-200 via-red-200 to-yellow-200 shadow-2xl">
              {/* Image Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Calendar className="h-24 w-24 mx-auto mb-4 opacity-30" />
                  <p className="text-sm font-medium">Hero Image {index + 1}</p>
                  <p className="text-xs">Add your event photo here</p>
                </div>
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                <h3 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                  {slide.title}
                </h3>
                <p className="text-lg md:text-xl text-white/90 drop-shadow-md max-w-2xl">
                  {slide.description}
                </p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  )
}
