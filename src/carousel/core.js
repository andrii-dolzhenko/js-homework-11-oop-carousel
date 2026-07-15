import {
  DEFAULT_SETTINGS,
  CSS_CLASSES,
  ELEMENT_IDS,
  KEYS
} from './helpers/config.js'

class Carousel {
  #currentSlide
  #timerId
  #contentAnimationFrameId
  #progressAnimation
  #progressCurrentScale
  #progressFromScale
  #progressToScale

  #pauseBtn
  #nextBtn
  #prevBtn
  #pauseIcon
  #playIcon
  #indicatorsContainer
  #indicatorItems
  #progressFill

  #content
  #currentNumber
  #timelineNumber
  #productLabel
  #productTitle
  #productDescription
  #productPrice

  #SLIDES_COUNT
  #CODE_SPACE
  #CODE_LEFT_ARROW
  #CODE_RIGHT_ARROW
  #FA_PAUSE
  #FA_PLAY
  #FA_PREV
  #FA_NEXT

  constructor(options) {
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
  }

  #initProps() {
    this.#currentSlide = 0
    this.#contentAnimationFrameId = null
    this.#progressAnimation = null
    this.#progressCurrentScale = 1
    this.#progressFromScale = 1
    this.#progressToScale = 1

    this.#SLIDES_COUNT = this.slides.length
    this.#CODE_SPACE = KEYS.SPACE
    this.#CODE_LEFT_ARROW = KEYS.LEFT_ARROW
    this.#CODE_RIGHT_ARROW = KEYS.RIGHT_ARROW

    this.#FA_PAUSE = '<i class="fas fa-pause"></i>'
    this.#FA_PLAY = '<i class="fas fa-play"></i>'
    this.#FA_PREV =
      '<i class="fas fa-chevron-left"></i>'
    this.#FA_NEXT =
      '<i class="fas fa-chevron-right"></i>'
  }

  #initProductContent() {
    this.#content = this.container.querySelector(
      '.carousel__content'
    )

    this.#currentNumber =
      this.container.querySelector('#current-number')

    this.#productLabel =
      this.container.querySelector('#product-label')

    this.#productTitle =
      this.container.querySelector('#product-title')

    this.#productDescription =
      this.container.querySelector(
        '#product-description'
      )

    this.#productPrice =
      this.container.querySelector('#product-price')
  }

  #initControls() {
    const firstNumber =
      this.slides[0]?.dataset.number || '01'

    const totalNumber = String(
      this.#SLIDES_COUNT
    ).padStart(2, '0')

    const pauseIcon = `
      <span id="${ELEMENT_IDS.PAUSE_ICON}">
        ${this.#FA_PAUSE}
      </span>
    `

    const playIcon = `
      <span id="${ELEMENT_IDS.PLAY_ICON}">
        ${this.#FA_PLAY}
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
        ${this.#FA_PREV}
      </button>
    `

    const next = `
      <button
        id="${ELEMENT_IDS.NEXT_BTN}"
        class="${CSS_CLASSES.NEXT_BTN} carousel__arrow carousel__arrow--next"
        type="button"
        aria-label="Next product"
      >
        ${this.#FA_NEXT}
      </button>
    `

    const controls = document.createElement('div')

    controls.setAttribute(
      'class',
      `${CSS_CLASSES.CONTROLS} carousel__controls`
    )

    controls.innerHTML = prev + next + timeline

    this.container.append(controls)

    this.#pauseBtn = this.container.querySelector(
      `#${ELEMENT_IDS.PAUSE_BTN}`
    )

    this.#nextBtn = this.container.querySelector(
      `#${ELEMENT_IDS.NEXT_BTN}`
    )

    this.#prevBtn = this.container.querySelector(
      `#${ELEMENT_IDS.PREV_BTN}`
    )

    this.#pauseIcon = this.container.querySelector(
      `#${ELEMENT_IDS.PAUSE_ICON}`
    )

    this.#playIcon = this.container.querySelector(
      `#${ELEMENT_IDS.PLAY_ICON}`
    )

    this.#timelineNumber =
      this.container.querySelector('#timeline-number')

    this.#progressFill =
      this.container.querySelector('#progress-fill')

    this.isPlaying
      ? this.#pauseVisible()
      : this.#playVisible()
  }

  #initIndicators() {
    const indicators = document.createElement('ol')

    indicators.setAttribute(
      'id',
      ELEMENT_IDS.INDICATORS_CONTAINER
    )

    indicators.setAttribute(
      'class',
      `${CSS_CLASSES.INDICATORS} carousel__indicators`
    )

    for (let i = 0; i < this.#SLIDES_COUNT; i++) {
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

    this.#indicatorsContainer =
      this.container.querySelector(
        `#${ELEMENT_IDS.INDICATORS_CONTAINER}`
      )

    this.#indicatorItems =
      this.container.querySelectorAll(
        `.${CSS_CLASSES.INDICATOR}`
      )
  }

  #initEventListeners() {
    document.addEventListener(
      'keydown',
      this.#keydown.bind(this)
    )

    this.#pauseBtn.addEventListener(
      'click',
      this.pausePlay.bind(this)
    )

    this.#nextBtn.addEventListener(
      'click',
      this.next.bind(this)
    )

    this.#prevBtn.addEventListener(
      'click',
      this.prev.bind(this)
    )

    this.#indicatorsContainer.addEventListener(
      'click',
      this.#indicatorClick.bind(this)
    )

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

  #gotoNth(n) {
    this.slides[
      this.#currentSlide
    ].classList.toggle(CSS_CLASSES.ACTIVE)

    this.#indicatorItems[
      this.#currentSlide
    ].classList.toggle(CSS_CLASSES.ACTIVE)

    this.#currentSlide =
      (n + this.#SLIDES_COUNT) % this.#SLIDES_COUNT

    this.slides[
      this.#currentSlide
    ].classList.toggle(CSS_CLASSES.ACTIVE)

    this.#indicatorItems[
      this.#currentSlide
    ].classList.toggle(CSS_CLASSES.ACTIVE)

    this.#updateSlidePositions()
    this.#updateProductContent()
    this.#syncProgressToSlide()
  }

  #gotoNext() {
    this.#gotoNth(this.#currentSlide + 1)
  }

  #gotoPrev() {
    this.#gotoNth(this.#currentSlide - 1)
  }

  #indicatorClick(event) {
    const target = event.target

    if (
      target &&
      target.classList.contains(
        CSS_CLASSES.INDICATOR
      )
    ) {
      this.pause()
      this.#gotoNth(+target.dataset.slideTo)
    }
  }

  #keydown(event) {
    const carouselKeys = [
      this.#CODE_LEFT_ARROW,
      this.#CODE_RIGHT_ARROW,
      this.#CODE_SPACE
    ]

    if (!carouselKeys.includes(event.code)) {
      return
    }

    event.preventDefault()

    if (event.code === this.#CODE_LEFT_ARROW) {
      this.prev()
    }

    if (event.code === this.#CODE_RIGHT_ARROW) {
      this.next()
    }

    if (event.code === this.#CODE_SPACE) {
      this.pausePlay()
    }
  }

  #updateSlidePositions() {
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

    if (this.#SLIDES_COUNT < 2) {
      return
    }

    const trailOneIndex =
      (
        this.#currentSlide -
        1 +
        this.#SLIDES_COUNT
      ) % this.#SLIDES_COUNT

    const trailTwoIndex =
      (
        this.#currentSlide -
        2 +
        this.#SLIDES_COUNT
      ) % this.#SLIDES_COUNT

    const entryIndex =
      (this.#currentSlide + 1) %
      this.#SLIDES_COUNT

    this.slides[trailOneIndex].classList.add(
      'position-prev',
      'trail-1'
    )

    if (
      this.#SLIDES_COUNT > 2 &&
      trailTwoIndex !== trailOneIndex
    ) {
      this.slides[trailTwoIndex].classList.add(
        'trail-2'
      )
    }

    if (
      this.#SLIDES_COUNT > 3 &&
      entryIndex !== trailOneIndex &&
      entryIndex !== trailTwoIndex
    ) {
      this.slides[entryIndex].classList.add(
        'position-next',
        'orbit-entry'
      )
    }
  }

  #restartContentAnimation() {
    if (!this.#content) {
      return
    }

    if (
      this.#contentAnimationFrameId !== null &&
      typeof window.cancelAnimationFrame ===
        'function'
    ) {
      window.cancelAnimationFrame(
        this.#contentAnimationFrameId
      )
    }

    this.#content.classList.remove('is-changing')

    if (
      typeof window.requestAnimationFrame !==
      'function'
    ) {
      this.#content.classList.add('is-changing')
      return
    }

    this.#contentAnimationFrameId =
      window.requestAnimationFrame(() => {
        this.#content.classList.add(
          'is-changing'
        )
      })
  }

  #updateProductContent(animate = true) {
    const activeSlide =
      this.slides[this.#currentSlide]

    if (!activeSlide || !activeSlide.dataset.title) {
      return
    }

    if (activeSlide.dataset.tint) {
      this.container.dataset.tint =
        activeSlide.dataset.tint
    }

    if (this.#currentNumber) {
      this.#currentNumber.textContent =
        activeSlide.dataset.number
    }

    if (this.#timelineNumber) {
      this.#timelineNumber.textContent =
        activeSlide.dataset.number
    }

    if (this.#productLabel) {
      this.#productLabel.textContent =
        activeSlide.dataset.label
    }

    if (this.#productTitle) {
      this.#productTitle.textContent =
        activeSlide.dataset.title
    }

    if (this.#productDescription) {
      this.#productDescription.textContent =
        activeSlide.dataset.description
    }

    if (this.#productPrice) {
      this.#productPrice.textContent =
        activeSlide.dataset.price
    }

    if (animate) {
      this.#restartContentAnimation()
    }
  }

  #getProgressScaleForSlide() {
    if (this.#SLIDES_COUNT <= 1) {
      return 1
    }

    return (
      1 -
      this.#currentSlide / this.#SLIDES_COUNT
    )
  }

  #getProgressTargetScale() {
    if (this.#SLIDES_COUNT <= 1) {
      return 1
    }

    return (
      1 -
      (this.#currentSlide + 1) /
        this.#SLIDES_COUNT
    )
  }

  #applyProgressScale(scale) {
    this.#progressCurrentScale = Math.max(
      0,
      Math.min(scale, 1)
    )

    if (this.#progressFill) {
      this.#progressFill.style.transform =
        `scaleX(${this.#progressCurrentScale})`
    }
  }

#cancelProgressAnimation() {
  const animation = this.#progressAnimation

  if (!animation) {
    return
  }

  animation.onfinish = null
  animation.cancel()
  this.#progressAnimation = null
}

  #captureProgressPosition() {
    if (!this.#progressAnimation) {
      return
    }

    const currentTime = Math.min(
      Number(
        this.#progressAnimation.currentTime
      ) || 0,
      this.TIMER_INTERVAL
    )

    const progress = this.TIMER_INTERVAL
      ? currentTime / this.TIMER_INTERVAL
      : 1

    const currentScale =
      this.#progressFromScale +
      (
        this.#progressToScale -
        this.#progressFromScale
      ) *
        progress

    this.#cancelProgressAnimation()
    this.#applyProgressScale(currentScale)
  }

  #startProgressAnimation() {
  if (
    !this.isPlaying ||
    !this.#progressFill ||
    this.#SLIDES_COUNT <= 1
  ) {
    return
  }

  this.#cancelProgressAnimation()

  this.#progressFromScale =
    this.#progressCurrentScale

  this.#progressToScale =
    this.#getProgressTargetScale()

  if (
    typeof this.#progressFill.animate !==
    'function'
  ) {
    return
  }

  const targetScale = this.#progressToScale

  const animation = this.#progressFill.animate(
    [
      {
        transform:
          `scaleX(${this.#progressFromScale})`
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

  this.#progressAnimation = animation

  animation.onfinish = () => {
    if (this.#progressAnimation !== animation) {
      return
    }

    animation.onfinish = null
    animation.cancel()

    this.#progressAnimation = null
    this.#applyProgressScale(targetScale)
  }
}

  #syncProgressToSlide() {
    this.#cancelProgressAnimation()

    this.#applyProgressScale(
      this.#getProgressScaleForSlide()
    )

    if (this.isPlaying) {
      this.#startProgressAnimation()
    }
  }

  #tick() {
    if (!this.isPlaying || this.#timerId) {
      return
    }

    this.#timerId = setInterval(
      () => this.#gotoNext(),
      this.TIMER_INTERVAL
    )
  }

  #pauseVisible(isVisible = true) {
    this.#pauseIcon.style.opacity =
      isVisible ? 1 : 0

    this.#playIcon.style.opacity =
      isVisible ? 0 : 1

    this.#pauseBtn.setAttribute(
      'aria-label',
      isVisible
        ? 'Pause carousel'
        : 'Play carousel'
    )
  }

  #playVisible() {
    this.#pauseVisible(false)
  }

  pausePlay() {
    this.isPlaying
      ? this.pause()
      : this.play()
  }

  pause() {
    if (!this.isPlaying) {
      return
    }

    this.#captureProgressPosition()
    this.#playVisible()
    this.container.classList.add('is-paused')
    this.isPlaying = false

    clearInterval(this.#timerId)
    this.#timerId = null
  }

  play() {
    if (this.isPlaying) {
      return
    }

    this.#pauseVisible()
    this.container.classList.remove('is-paused')
    this.isPlaying = true

    this.#startProgressAnimation()
    this.#tick()
  }

  next() {
    this.pause()
    this.#gotoNext()
  }

  prev() {
    this.pause()
    this.#gotoPrev()
  }

  init() {
    this.#initProps()
    this.#initProductContent()
    this.#initControls()
    this.#initIndicators()
    this.#initEventListeners()
    this.#updateSlidePositions()
    this.#updateProductContent(false)
    this.#syncProgressToSlide()
    this.#tick()
  }
}

export default Carousel