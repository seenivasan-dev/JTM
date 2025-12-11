"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Heart } from "lucide-react"

const galleryImages = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  alt: `Community event ${i + 1}`,
}))

export function GallerySlider() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {galleryImages.map((image) => (
          <CarouselItem key={image.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
            <div className="aspect-square bg-gradient-to-br from-orange-200 to-red-200 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg cursor-pointer">
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-medium">Photo {image.id}</p>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-0" />
      <CarouselNext className="right-0" />
    </Carousel>
  )
}
