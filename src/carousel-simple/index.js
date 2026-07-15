/**
 * Carousel Module by Rustam Aslami https://github.com/nuhzdenegnetu
 * @description Exports carousel components with different functionality
 */

class Carousel {
  constructor(p) {
    const settings = {
      containerId: '#carousel',
      slideId: '.slide',
      interval: 5000,
      isPlaying: true,
      pauseOnHover: false,
      errorHandler: null,
      ...p
    }

    this.container = document.querySelector(settings.containerId)
    if (!this.container) throw new TypeError('Container not found')

    this.slideItems = this.container.querySelectorAll(settings.slideId)
    if (!this.slideItems.length) throw new TypeError('Slides not found')

    this.TIMER_INTERVAL = settings.interval
    this.isPlaying = settings.isPlaying
    this.pauseOnHover = settings.pauseOnHover
    this.currentSlide = 0
    this.timerId = null
    this.SLIDES_COUNT = this.slideItems.length
    this.CODE_SPACE = 'Space'
    this.CODE_LEFT_ARROW = 'ArrowLeft'
    this.CODE_RIGHT_ARROW = 'ArrowRight'
    this.errorHandler = settings.errorHandler
  }

  get slides() {
    return this.slideItems
  }

  init() {
    this._initControls()
    this._initIndicators()
    this._initListeners()

    // Активуємо перший слайд
    this.slideItems[0].classList.add('active')

    if (this.isPlaying) {
      this._tick()
    }
  }

  _initControls() {
    const controls = document.createElement('div')
    controls.setAttribute('id', 'controls-container')
    controls.innerHTML = `
      <button id="pause-btn">
        <i id="fa-pause-icon" class="far fa-pause-circle" style="opacity:1"></i>
        <i id="fa-play-icon" class="far fa-play-circle" style="opacity:0"></i>
      </button>
      <button id="prev-btn"></button>
      <button id="next-btn"></button>
    `
    this.container.append(controls)
  }

  _toggleIcons() {
    const pauseIcon = this.container.querySelector('#fa-pause-icon')
    const playIcon = this.container.querySelector('#fa-play-icon')
    if (pauseIcon && playIcon) {
      pauseIcon.style.opacity = this.isPlaying ? '1' : '0'
      playIcon.style.opacity = this.isPlaying ? '0' : '1'
    }
  }

  _initIndicators() {
    const indicators = document.createElement('div')
    indicators.setAttribute('id', 'indicators-container')

    for (let i = 0; i < this.SLIDES_COUNT; i++) {
      const indicator = document.createElement('div')
      indicator.classList.add('indicator')
      indicator.dataset.slideTo = i
      if (i === 0) indicator.classList.add('active')
      indicators.append(indicator)
    }

    this.container.append(indicators)
  }

  _initListeners() {
    document.addEventListener('keydown', this._pressKey.bind(this))

    const pauseBtn = this.container.querySelector('#pause-btn')
    const nextBtn = this.container.querySelector('#next-btn')
    const prevBtn = this.container.querySelector('#prev-btn')
    const indicators = this.container.querySelector('#indicators-container')

    pauseBtn.addEventListener('click', this.pausePlay.bind(this))
    nextBtn.addEventListener('click', this.next.bind(this))
    prevBtn.addEventListener('click', this.prev.bind(this))
    indicators.addEventListener('click', this._indicateHandler.bind(this))

    if (this.pauseOnHover) {
      this.container.addEventListener('mouseenter', this.pause.bind(this))
      this.container.addEventListener('mouseleave', this.play.bind(this))
    }
  }

  _pressKey(e) {
    if (e.code === this.CODE_LEFT_ARROW) this.prev()
    if (e.code === this.CODE_RIGHT_ARROW) this.next()
    if (e.code === this.CODE_SPACE) {
      e.preventDefault()
      this.pausePlay()
    }
  }

  _indicateHandler(e) {
    const target = e.target
    if (target && target.classList.contains('indicator')) {
      this.pause()
      const slideTo = +target.dataset.slideTo
      if (isNaN(slideTo)) {
        const slides = this.container.querySelectorAll('.slide')
        const indicators = this.container.querySelectorAll('.indicator')
        slides.forEach((slide) => slide.classList.remove('active'))
        indicators.forEach((ind) => ind.classList.remove('active'))
        const error = new TypeError('Invalid slide index')
        if (typeof this.errorHandler === 'function') {
          this.errorHandler({ error, event: e })
        } else {
          throw error
        }
        return
      }
      this._gotoNth(slideTo)
    }
  }

  _tick() {
    if (!this.isPlaying) return
    if (this.SLIDES_COUNT <= 1) return // не запускать автоматическую смену при 1 слайде
    this.timerId = setInterval(() => {
      this._gotoNth(this.currentSlide + 1)
    }, this.TIMER_INTERVAL)
  }

  _gotoNth(n) {
    const slides = this.container.querySelectorAll('.slide')
    const indicators = this.container.querySelectorAll('.indicator')

    if (isNaN(n)) {
      return
    }

    slides[this.currentSlide]?.classList.toggle('active')
    indicators[this.currentSlide]?.classList.toggle('active')
    this.currentSlide = (n + this.SLIDES_COUNT) % this.SLIDES_COUNT
    slides[this.currentSlide]?.classList.toggle('active')
    indicators[this.currentSlide]?.classList.toggle('active')
  }

  pause() {
    if (!this.isPlaying) return
    this.isPlaying = false
    clearInterval(this.timerId)
    this.timerId = null
    this._toggleIcons()
  }

  play() {
    if (this.isPlaying) return
    this.isPlaying = true
    this._tick()
    this._toggleIcons()
  }

  pausePlay() {
    this.isPlaying ? this.pause() : this.play()
  }

  next = () => {
    this.pause()
    this._gotoNth(this.currentSlide + 1)
  }

  prev = () => {
    this.pause()
    this._gotoNth(this.currentSlide - 1)
  }
}

class SwipeCarousel extends Carousel {
  constructor(options) {
    super(options)
    this.slidesContainer = this.slideItems[0]?.parentElement
    this.startPosX = null
    this.endPosX = null
    this.swipeThreshold = options.swipeThreshold !== undefined ? options.swipeThreshold : 100
  }

  _initListeners() {
    super._initListeners()
    this.container.addEventListener('touchstart', this._swipeStart, { passive: true })
    this.container.addEventListener('mousedown', this._swipeStart)
    this.container.addEventListener('touchend', this._swipeEnd)
    this.container.addEventListener('mouseup', this._swipeEnd)
  }

  _swipeStart = (e) => {
    this.startPosX = e instanceof MouseEvent ? e.clientX : e.changedTouches[0].pageX
  }

  _swipeEnd = (e) => {
    this.endPosX = e instanceof MouseEvent ? e.clientX : e.changedTouches[0].pageX

    if (this.startPosX !== null && this.endPosX !== null) {
      const swipeDiff = this.endPosX - this.startPosX
      if (Math.abs(swipeDiff) > (this.swipeThreshold || 0)) {
        if (swipeDiff > 0) {
          this.prev()
        } else if (swipeDiff < 0) {
          this.next()
        }
      }
    }
    this.startPosX = null
    this.endPosX = null
  }
}
export { Carousel, SwipeCarousel }
export default SwipeCarousel
