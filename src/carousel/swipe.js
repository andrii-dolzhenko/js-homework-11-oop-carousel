import Carousel from './core.js'
import { DEFAULT_SETTINGS } from './helpers/config.js'

function SwipeCarousel(options) {
  const swipeSettings = {
    ...DEFAULT_SETTINGS,
    ...options
  }

  Carousel.call(this, swipeSettings)

  this.slidesContainer =
    this.slides[0]?.parentElement

  this._startPosX = 0
  this._endPosX = 0
  this._swipeThreshold =
    swipeSettings.swipeThreshold
  this._isDragging = false
}

SwipeCarousel.prototype = Object.create(
  Carousel.prototype
)

SwipeCarousel.prototype.constructor = SwipeCarousel

SwipeCarousel.prototype._preventDrag = function (event) {
  event.preventDefault()
  return false
}

SwipeCarousel.prototype._swipeStart = function (event) {
  this._isDragging = true

  this._startPosX =
    event instanceof MouseEvent
      ? event.pageX
      : event.changedTouches[0].pageX
}

SwipeCarousel.prototype._swipeEnd = function (event) {
  if (!this._isDragging) {
    return
  }

  this._endPosX =
    event instanceof MouseEvent
      ? event.pageX
      : event.changedTouches[0].pageX

  this._isDragging = false

  const swipeDistance =
    this._endPosX - this._startPosX

  if (swipeDistance > this._swipeThreshold) {
    this.prev()
  }

  if (swipeDistance < -this._swipeThreshold) {
    this.next()
  }
}

SwipeCarousel.prototype._mouseLeave = function () {
  this._isDragging = false
}

SwipeCarousel.prototype.init = function () {
  Carousel.prototype.init.call(this)

  this.container.addEventListener(
    'dragstart',
    this._preventDrag
  )

  this.container.addEventListener(
    'touchstart',
    this._swipeStart.bind(this),
    { passive: true }
  )

  this.slidesContainer.addEventListener(
    'mousedown',
    this._swipeStart.bind(this)
  )

  this.container.addEventListener(
    'touchend',
    this._swipeEnd.bind(this)
  )

  this.slidesContainer.addEventListener(
    'mouseup',
    this._swipeEnd.bind(this)
  )

  this.slidesContainer.addEventListener(
    'mouseleave',
    this._mouseLeave.bind(this)
  )
}

export default SwipeCarousel
