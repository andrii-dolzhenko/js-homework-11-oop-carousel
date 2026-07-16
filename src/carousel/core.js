import {
  DEFAULT_SETTINGS,
  CSS_CLASSES,
  ELEMENT_IDS,
  KEYS
} from './helpers/config.js'

function Carousel(options) {
  const settings = {
    ...DEFAULT_SETTINGS,
    ...options
  }

  this.container = document.querySelector(
    settings.containerId
  )

  this.slides = this.container.querySelectorAll(
    settings.slideId
  )

  this.TIMER_INTERVAL = settings.interval
  this.isPlaying = settings.isPlaying
  this.pauseOnHover = settings.pauseOnHover
  this.showIndicators = settings.showIndicators
}

Carousel.prototype._initProps = function () {
  this.currentSlide = 0
  this._timerId = null
  this._contentAnimationFrameId = null
  this._progressAnimation = null
  this._progressCurrentScale = 1
  this._progressFromScale = 1
  this._progressToScale = 1

  this._pauseBtn = null
  this._nextBtn = null
  this._prevBtn = null
  this._pauseIcon = null
  this._playIcon = null
  this._indicatorsContainer = null
  this._indicatorItems = []
  this._progressFill = null

  this._content = null
  this._currentNumber = null
  this._timelineNumber = null
  this._productLabel = null
  this._productTitle = null
  this._productDescription = null
  this._productPrice = null

  this.SLIDES_COUNT = this.slides.length
  this._CODE_SPACE = KEYS.SPACE
  this._CODE_LEFT_ARROW = KEYS.LEFT_ARROW
  this._CODE_RIGHT_ARROW = KEYS.RIGHT_ARROW

  this._FA_PAUSE = '<i class="fas fa-pause"></i>'
  this._FA_PLAY = '<i class="fas fa-play"></i>'
  this._FA_PREV = '<i class="fas fa-chevron-left"></i>'
  this._FA_NEXT = '<i class="fas fa-chevron-right"></i>'
}

Carousel.prototype._initProductContent = function () {
  this._content = this.container.querySelector(
    '.carousel__content'
  )

  this._currentNumber =
    this.container.querySelector('#current-number')

  this._productLabel =
    this.container.querySelector('#product-label')

  this._productTitle =
    this.container.querySelector('#product-title')

  this._productDescription =
    this.container.querySelector(
      '#product-description'
    )

  this._productPrice =
    this.container.querySelector('#product-price')
}

Carousel.prototype._initControls = function () {
  const firstNumber =
    this.slides[0]?.dataset.number || '01'

  const totalNumber = String(
    this.SLIDES_COUNT
  ).padStart(2, '0')

  const pauseIcon = `
    <span id="${ELEMENT_IDS.PAUSE_ICON}">
      ${this._FA_PAUSE}
    </span>
  `

  const playIcon = `
    <span id="${ELEMENT_IDS.PLAY_ICON}">
      ${this._FA_PLAY}
    </span>
  `

  const pause = `
    <button
      id="${ELEMENT_IDS.PAUSE_BTN}"
      class="${CSS_CLASSES.PAUSE_BTN} carousel__playback"
      type="button"
      aria-label="Pause carousel"
    >
      ${pauseIcon}
      ${playIcon}
    </button>
  `

  const progress = `
    <div
      class="carousel__progress"
      aria-hidden="true"
    >
      <span
        id="progress-fill"
        class="carousel__progress-fill"
      ></span>
    </div>
  `

  const counter = `
    <p class="carousel__timeline-counter">
      <span id="timeline-number">
        ${firstNumber}
      </span>

      <span aria-hidden="true">/</span>
      <span>${totalNumber}</span>
    </p>
  `

  const timeline = `
    <div class="carousel__timeline">
      ${pause}
      ${progress}
      ${counter}
    </div>
  `

  const prev = `
    <button
      id="${ELEMENT_IDS.PREV_BTN}"
      class="${CSS_CLASSES.PREV_BTN} carousel__arrow carousel__arrow--prev"
      type="button"
      aria-label="Previous product"
    >
      ${this._FA_PREV}
    </button>
  `

  const next = `
    <button
      id="${ELEMENT_IDS.NEXT_BTN}"
      class="${CSS_CLASSES.NEXT_BTN} carousel__arrow carousel__arrow--next"
      type="button"
      aria-label="Next product"
    >
      ${this._FA_NEXT}
    </button>
  `

  const controls = document.createElement('div')

  controls.setAttribute(
    'class',
    `${CSS_CLASSES.CONTROLS} carousel__controls`
  )

  controls.innerHTML = prev + next + timeline
  this.container.append(controls)

  this._pauseBtn = this.container.querySelector(
    `#${ELEMENT_IDS.PAUSE_BTN}`
  )

  this._nextBtn = this.container.querySelector(
    `#${ELEMENT_IDS.NEXT_BTN}`
  )

  this._prevBtn = this.container.querySelector(
    `#${ELEMENT_IDS.PREV_BTN}`
  )

  this._pauseIcon = this.container.querySelector(
    `#${ELEMENT_IDS.PAUSE_ICON}`
  )

  this._playIcon = this.container.querySelector(
    `#${ELEMENT_IDS.PLAY_ICON}`
  )

  this._timelineNumber =
    this.container.querySelector('#timeline-number')

  this._progressFill =
    this.container.querySelector('#progress-fill')

  this.isPlaying
    ? this._pauseVisible()
    : this._playVisible()
}

Carousel.prototype._initIndicators = function () {
  if (!this.showIndicators) {
    this._indicatorItems = []
    return
  }

  const indicators = document.createElement('ol')

  indicators.setAttribute(
    'id',
    ELEMENT_IDS.INDICATORS_CONTAINER
  )

  indicators.setAttribute(
    'class',
    `${CSS_CLASSES.INDICATORS} carousel__indicators`
  )

  for (let i = 0; i < this.SLIDES_COUNT; i++) {
    const indicator = document.createElement('li')

    indicator.setAttribute(
      'class',
      i
        ? CSS_CLASSES.INDICATOR
        : `${CSS_CLASSES.INDICATOR} ${CSS_CLASSES.ACTIVE}`
    )

    indicator.dataset.slideTo = `${i}`
    indicators.append(indicator)
  }

  this.container.append(indicators)

  this._indicatorsContainer =
    this.container.querySelector(
      `#${ELEMENT_IDS.INDICATORS_CONTAINER}`
    )

  this._indicatorItems =
    this.container.querySelectorAll(
      `.${CSS_CLASSES.INDICATOR}`
    )
}

Carousel.prototype._initEventListeners = function () {
  document.addEventListener(
    'keydown',
    this._keydown.bind(this)
  )

  this._pauseBtn.addEventListener(
    'click',
    this.pausePlay.bind(this)
  )

  this._nextBtn.addEventListener(
    'click',
    this.next.bind(this)
  )

  this._prevBtn.addEventListener(
    'click',
    this.prev.bind(this)
  )

  if (this._indicatorsContainer) {
    this._indicatorsContainer.addEventListener(
      'click',
      this._indicatorClick.bind(this)
    )
  }

  if (this.pauseOnHover) {
    this.container.addEventListener(
      'mouseenter',
      this.pause.bind(this)
    )

    this.container.addEventListener(
      'mouseleave',
      this.play.bind(this)
    )
  }
}

Carousel.prototype._gotoNth = function (n) {
  this.slides[
    this.currentSlide
  ].classList.toggle(CSS_CLASSES.ACTIVE)

  if (this._indicatorItems[this.currentSlide]) {
    this._indicatorItems[
      this.currentSlide
    ].classList.toggle(CSS_CLASSES.ACTIVE)
  }

  this.currentSlide = (n + this.SLIDES_COUNT) % this.SLIDES_COUNT

  this.slides[
    this.currentSlide
  ].classList.toggle(CSS_CLASSES.ACTIVE)

  if (this._indicatorItems[this.currentSlide]) {
    this._indicatorItems[
      this.currentSlide
    ].classList.toggle(CSS_CLASSES.ACTIVE)
  }

  this._updateSlidePositions()
  this._updateProductContent()
  this._syncProgressToSlide()
}

Carousel.prototype._gotoNext = function () {
  this._gotoNth(this.currentSlide + 1)
}

Carousel.prototype._gotoPrev = function () {
  this._gotoNth(this.currentSlide - 1)
}

Carousel.prototype._indicatorClick = function (event) {
  const target = event.target

  if (
    target &&
    target.classList.contains(
      CSS_CLASSES.INDICATOR
    )
  ) {
    this.pause()
    this._gotoNth(+target.dataset.slideTo)
  }
}

Carousel.prototype._keydown = function (event) {
  const carouselKeys = [
    this._CODE_LEFT_ARROW,
    this._CODE_RIGHT_ARROW,
    this._CODE_SPACE
  ]

  if (!carouselKeys.includes(event.code)) {
    return
  }

  event.preventDefault()

  if (event.code === this._CODE_LEFT_ARROW) {
    this.prev()
  }

  if (event.code === this._CODE_RIGHT_ARROW) {
    this.next()
  }

  if (event.code === this._CODE_SPACE) {
    this.pausePlay()
  }
}

Carousel.prototype._updateSlidePositions = function () {
  const positionClasses = [
    'position-prev',
    'position-next',
    'orbit-prev-1',
    'orbit-prev-2',
    'orbit-next-1',
    'orbit-next-2',
    'trail-1',
    'trail-2',
    'orbit-entry'
  ]

  this.slides.forEach((slide) => {
    slide.classList.remove(...positionClasses)
  })

  if (this.SLIDES_COUNT < 2) {
    return
  }

  const trailOneIndex =
    (
      this.currentSlide -
      1 +
      this.SLIDES_COUNT
    ) % this.SLIDES_COUNT

  const trailTwoIndex =
    (
      this.currentSlide -
      2 +
      this.SLIDES_COUNT
    ) % this.SLIDES_COUNT

  const entryIndex =
    (this.currentSlide + 1) %
    this.SLIDES_COUNT

  this.slides[trailOneIndex].classList.add(
    'position-prev',
    'trail-1'
  )

  if (
    this.SLIDES_COUNT > 2 &&
    trailTwoIndex !== trailOneIndex
  ) {
    this.slides[trailTwoIndex].classList.add(
      'trail-2'
    )
  }

  if (
    this.SLIDES_COUNT > 3 &&
    entryIndex !== trailOneIndex &&
    entryIndex !== trailTwoIndex
  ) {
    this.slides[entryIndex].classList.add(
      'position-next',
      'orbit-entry'
    )
  }
}

Carousel.prototype._restartContentAnimation = function () {
  if (!this._content) {
    return
  }

  if (
    this._contentAnimationFrameId !== null &&
    typeof window.cancelAnimationFrame ===
      'function'
  ) {
    window.cancelAnimationFrame(
      this._contentAnimationFrameId
    )
  }

  this._content.classList.remove('is-changing')

  if (
    typeof window.requestAnimationFrame !==
    'function'
  ) {
    this._content.classList.add('is-changing')
    return
  }

  this._contentAnimationFrameId =
    window.requestAnimationFrame(() => {
      this._content.classList.add(
        'is-changing'
      )
    })
}

Carousel.prototype._updateProductContent = function (
  animate = true
) {
  const activeSlide =
    this.slides[this.currentSlide]

  if (!activeSlide || !activeSlide.dataset.title) {
    return
  }

  if (activeSlide.dataset.tint) {
    this.container.dataset.tint =
      activeSlide.dataset.tint
  }

  if (this._currentNumber) {
    this._currentNumber.textContent =
      activeSlide.dataset.number
  }

  if (this._timelineNumber) {
    this._timelineNumber.textContent =
      activeSlide.dataset.number
  }

  if (this._productLabel) {
    this._productLabel.textContent =
      activeSlide.dataset.label
  }

  if (this._productTitle) {
    this._productTitle.textContent =
      activeSlide.dataset.title
  }

  if (this._productDescription) {
    this._productDescription.textContent =
      activeSlide.dataset.description
  }

  if (this._productPrice) {
    this._productPrice.textContent =
      activeSlide.dataset.price
  }

  if (animate) {
    this._restartContentAnimation()
  }
}

Carousel.prototype._getProgressScaleForSlide = function () {
  if (this.SLIDES_COUNT <= 1) {
    return 1
  }

  return (
    1 -
    this.currentSlide / this.SLIDES_COUNT
  )
}

Carousel.prototype._getProgressTargetScale = function () {
  if (this.SLIDES_COUNT <= 1) {
    return 1
  }

  return (
    1 -
    (this.currentSlide + 1) /
      this.SLIDES_COUNT
  )
}

Carousel.prototype._applyProgressScale = function (scale) {
  this._progressCurrentScale = Math.max(
    0,
    Math.min(scale, 1)
  )

  if (this._progressFill) {
    this._progressFill.style.transform =
      `scaleX(${this._progressCurrentScale})`
  }
}

Carousel.prototype._cancelProgressAnimation = function () {
  const animation = this._progressAnimation

  if (!animation) {
    return
  }

  animation.onfinish = null
  animation.cancel()
  this._progressAnimation = null
}

Carousel.prototype._captureProgressPosition = function () {
  if (!this._progressAnimation) {
    return
  }

  const currentTime = Math.min(
    Number(
      this._progressAnimation.currentTime
    ) || 0,
    this.TIMER_INTERVAL
  )

  const progress = this.TIMER_INTERVAL
    ? currentTime / this.TIMER_INTERVAL
    : 1

  const currentScale =
    this._progressFromScale +
    (
      this._progressToScale -
      this._progressFromScale
    ) *
      progress

  this._cancelProgressAnimation()
  this._applyProgressScale(currentScale)
}

Carousel.prototype._startProgressAnimation = function () {
  if (
    !this.isPlaying ||
    !this._progressFill ||
    this.SLIDES_COUNT <= 1
  ) {
    return
  }

  this._cancelProgressAnimation()

  this._progressFromScale =
    this._progressCurrentScale

  this._progressToScale =
    this._getProgressTargetScale()

  if (
    typeof this._progressFill.animate !==
    'function'
  ) {
    return
  }

  const targetScale = this._progressToScale

  const animation = this._progressFill.animate(
    [
      {
        transform:
          `scaleX(${this._progressFromScale})`
      },
      {
        transform:
          `scaleX(${targetScale})`
      }
    ],
    {
      duration: this.TIMER_INTERVAL,
      easing: 'linear'
    }
  )

  this._progressAnimation = animation

  animation.onfinish = () => {
    if (this._progressAnimation !== animation) {
      return
    }

    animation.onfinish = null
    animation.cancel()

    this._progressAnimation = null
    this._applyProgressScale(targetScale)
  }
}

Carousel.prototype._syncProgressToSlide = function () {
  this._cancelProgressAnimation()

  this._applyProgressScale(
    this._getProgressScaleForSlide()
  )

  if (this.isPlaying) {
    this._startProgressAnimation()
  }
}

Carousel.prototype._tick = function () {
  if (!this.isPlaying || this._timerId) {
    return
  }

  this._timerId = setInterval(
    () => this._gotoNext(),
    this.TIMER_INTERVAL
  )
}

Carousel.prototype._pauseVisible = function (
  isVisible = true
) {
  this._pauseIcon.style.opacity =
    isVisible ? 1 : 0

  this._playIcon.style.opacity =
    isVisible ? 0 : 1

  this._pauseBtn.setAttribute(
    'aria-label',
    isVisible
      ? 'Pause carousel'
      : 'Play carousel'
  )
}

Carousel.prototype._playVisible = function () {
  this._pauseVisible(false)
}

Carousel.prototype.pausePlay = function () {
  this.isPlaying
    ? this.pause()
    : this.play()
}

Carousel.prototype.pause = function () {
  if (!this.isPlaying) {
    return
  }

  this._captureProgressPosition()
  this._playVisible()
  this.container.classList.add('is-paused')
  this.isPlaying = false

  clearInterval(this._timerId)
  this._timerId = null
}

Carousel.prototype.play = function () {
  if (this.isPlaying) {
    return
  }

  this._pauseVisible()
  this.container.classList.remove('is-paused')
  this.isPlaying = true

  this._startProgressAnimation()
  this._tick()
}

Carousel.prototype.next = function () {
  this.pause()
  this._gotoNext()
}

Carousel.prototype.prev = function () {
  this.pause()
  this._gotoPrev()
}

Carousel.prototype.init = function () {
  this._initProps()
  this._initProductContent()
  this._initControls()
  this._initIndicators()
  this._initEventListeners()
  this._updateSlidePositions()
  this._updateProductContent(false)
  this._syncProgressToSlide()
  this._tick()
}

export default Carousel
