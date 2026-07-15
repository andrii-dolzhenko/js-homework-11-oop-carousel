import SwipeCarousel from './carousel/index.js'

const carouselElement =
  document.querySelector('#carousel')

const carouselConfig = {
  containerId: '#carousel',
  slideId: '.slide',
  interval:
    Number(carouselElement?.dataset.interval) || 2000,
  isPlaying: true,
  pauseOnHover: false
}

const carousel = new SwipeCarousel(carouselConfig)

carousel.init()

export default carousel