/*
 * @description
 *          Script creates a slide-show for structure .carousel>.slides>.slide[style=background-image:url()].
 * @author  Andrii.A.Fomenko
 * @revised 2025-04-10
 */

import { DEFAULT_SETTINGS, CSS_CLASSES, ELEMENT_IDS, KEYS } from './helpers/config.js'

/* carousel Class */
class Carousel {
  /* Private state variables - track the carousel state */
  #currentSlide
  #timerId

  /* Private DOM element references - cached DOM nodes for performance */
  #pauseBtn
  #nextBtn
  #prevBtn
  #pauseIcon
  #playIcon
  #indicatorsContainer
  #indicatorItems

  /* Private constants - fixed values used throughout the class */
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

    this.container = document.querySelector(settings.containerId)
    this.slides = this.container.querySelectorAll(settings.slideId)
    this.TIMER_INTERVAL = settings.interval
    this.isPlaying = settings.isPlaying
    this.pauseOnHover = settings.pauseOnHover
  }

  /* ========== PRIVATE INITIALIZATION METHODS ========== */

  #initProps() {
    this.#currentSlide = 0

    this.#SLIDES_COUNT = this.slides.length
    this.#CODE_SPACE = KEYS.SPACE
    this.#CODE_LEFT_ARROW = KEYS.LEFT_ARROW
    this.#CODE_RIGHT_ARROW = KEYS.RIGHT_ARROW
    this.#FA_PAUSE = '<i class="fas fa-pause"></i>'
    this.#FA_PLAY = '<i class="fas fa-play"></i>'
    this.#FA_PREV = '<i class="fas fa-chevron-left"></i>'
    this.#FA_NEXT = '<i class="fas fa-chevron-right"></i>'
  }

  #initControls() {
    // Створюємо окремі елементи для іконок паузи/відтворення
    const PAUSE_ICON = `<span id="${ELEMENT_IDS.PAUSE_ICON}">${this.#FA_PAUSE}</span>`
    const PLAY_ICON = `<span id="${ELEMENT_IDS.PLAY_ICON}">${this.#FA_PLAY}</span>`

    // Створюємо контейнер для іконок
    const PAUSE = `<span id="${ELEMENT_IDS.PAUSE_BTN}" class="${CSS_CLASSES.PAUSE_BTN}">
                     ${PAUSE_ICON}
                     ${PLAY_ICON}
                   </span>`

    // Створюємо кнопки навігації
    const PREV = `<span id="${ELEMENT_IDS.PREV_BTN}" class="${CSS_CLASSES.PREV_BTN}">${this.#FA_PREV}</span>`
    const NEXT = `<span id="${ELEMENT_IDS.NEXT_BTN}" class="${CSS_CLASSES.NEXT_BTN}">${this.#FA_NEXT}</span>`

    let controls = document.createElement('div')
    controls.setAttribute('class', CSS_CLASSES.CONTROLS)
    controls.innerHTML = PAUSE + PREV + NEXT

    this.container.append(controls)

    this.#pauseBtn = this.container.querySelector(`#${ELEMENT_IDS.PAUSE_BTN}`)
    this.#nextBtn = this.container.querySelector(`#${ELEMENT_IDS.NEXT_BTN}`)
    this.#prevBtn = this.container.querySelector(`#${ELEMENT_IDS.PREV_BTN}`)

    this.#pauseIcon = this.container.querySelector(`#${ELEMENT_IDS.PAUSE_ICON}`)
    this.#playIcon = this.container.querySelector(`#${ELEMENT_IDS.PLAY_ICON}`)

    this.isPlaying ? this.#pauseVisible() : this.#playVisible()
  }

  #initIndicators() {
    const indicators = document.createElement('ol')
    indicators.setAttribute('id', ELEMENT_IDS.INDICATORS_CONTAINER)
    indicators.setAttribute('class', CSS_CLASSES.INDICATORS)

    for (let i = 0, n = this.#SLIDES_COUNT; i < n; i++) {
      let indicator = document.createElement('li')

      indicator.setAttribute('class', i ? CSS_CLASSES.INDICATOR : `${CSS_CLASSES.INDICATOR} ${CSS_CLASSES.ACTIVE}`)
      indicator.dataset.slideTo = `${i}`
      indicators.append(indicator)
    }
    this.container.append(indicators)

    // this.#indicatorsContainer = this.container.querySelector(`.${CSS_CLASSES.INDICATORS}`)
    this.#indicatorsContainer = this.container.querySelector(`#${ELEMENT_IDS.INDICATORS_CONTAINER}`)
    this.#indicatorItems = this.container.querySelectorAll(`.${CSS_CLASSES.INDICATOR}`)
  }

  #initEventListeners() {
    document.addEventListener('keydown', this.#keydown.bind(this))
    this.#pauseBtn.addEventListener('click', this.pausePlay.bind(this))
    this.#nextBtn.addEventListener('click', this.next.bind(this))
    this.#prevBtn.addEventListener('click', this.prev.bind(this))
    this.#indicatorsContainer.addEventListener('click', this.#indicatorClick.bind(this))

    // Додаємо слухачі подій наведення миші тільки якщо опція pauseOnHover увімкнена
    if (this.pauseOnHover) {
      this.container.addEventListener('mouseenter', this.pause.bind(this))
      this.container.addEventListener('mouseleave', this.play.bind(this))
    }
  }

  /* ========== PRIVATE NAVIGATION METHODS ========== */

  #gotoNth(n) {
    this.slides[this.#currentSlide].classList.toggle(CSS_CLASSES.ACTIVE)
    this.#indicatorItems[this.#currentSlide].classList.toggle(CSS_CLASSES.ACTIVE)
    this.#currentSlide = (n + this.#SLIDES_COUNT) % this.#SLIDES_COUNT
    this.slides[this.#currentSlide].classList.toggle(CSS_CLASSES.ACTIVE)
    this.#indicatorItems[this.#currentSlide].classList.toggle(CSS_CLASSES.ACTIVE)
  }

  #gotoNext() {
    this.#gotoNth(this.#currentSlide + 1)
  }

  #gotoPrev() {
    this.#gotoNth(this.#currentSlide - 1)
  }

  /* ========== PRIVATE EVENT HANDLERS ========== */

  #indicatorClick(e) {
    const target = e.target

    if (target && target.classList.contains(CSS_CLASSES.INDICATOR)) {
      this.pause()
      this.#gotoNth(+target.dataset.slideTo)
    }
  }

  #keydown(e) {
    // Перевіряємо, чи натиснута клавіша використовується карусельою
    const isCarouselKey = [this.#CODE_LEFT_ARROW, this.#CODE_RIGHT_ARROW, this.#CODE_SPACE].includes(e.code)

    // Відміняємо стандартну поведінку тільки для клавіш карусельки
    if (isCarouselKey) {
      e.preventDefault()

      // Обробляємо натискання відповідних клавіш
      if (e.code === this.#CODE_LEFT_ARROW) this.prev()
      if (e.code === this.#CODE_RIGHT_ARROW) this.next()
      if (e.code === this.#CODE_SPACE) this.pausePlay()
    }
  }

  /* ========== PRIVATE UI METHODS ========== */

  #tick() {
    if (!this.isPlaying) return
    if (this.#timerId) return

    this.#timerId = setInterval(() => this.#gotoNext(), this.TIMER_INTERVAL)
  }

  #pauseVisible(isVisible = true) {
    this.#pauseIcon.style.opacity = isVisible ? 1 : 0
    this.#playIcon.style.opacity = isVisible ? 0 : 1
  }

  #playVisible() {
    this.#pauseVisible(false)
  }

  /* ========== PUBLIC API ========== */

  pausePlay() {
    this.isPlaying ? this.pause() : this.play()
  }

  pause() {
    if (!this.isPlaying) return
    this.#playVisible()
    this.isPlaying = false
    clearInterval(this.#timerId)
    this.#timerId = null
  }

  play() {
    if (this.isPlaying) return
    this.#pauseVisible()
    this.isPlaying = true
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
    this.#initControls()
    this.#initIndicators()
    this.#initEventListeners()
    this.#tick()
  }
}

export default Carousel
