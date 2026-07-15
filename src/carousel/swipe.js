import Carousel from './core.js'
import { DEFAULT_SETTINGS } from './helpers/config.js'

/**
 * SwipeCarousel Class - extends Carousel with touch/swipe functionality
 * Adds touch and mouse swipe support to the basic carousel
 */
class SwipeCarousel extends Carousel {
  /* Private state variables - for swipe tracking */
  #startPosX
  #endPosX
  #swipeThreshold
  #isDragging = false

  constructor(options) {
    // Додаємо додаткові налаштування для swipe функціональності
    const swipeSettings = {
      ...DEFAULT_SETTINGS,
      swipeThreshold: 100, // Мінімальна відстань свайпу для зміни слайда
      ...options
    }

    super(swipeSettings)
    this.slidesContainer = this.slides[0]?.parentElement
    this.#swipeThreshold = swipeSettings.swipeThreshold
  }

  /* ========== PRIVATE EVENT HANDLERS ========== */

  /**
   * Prevent default drag behavior
   * Stops images and other elements from being dragged
   */
  #preventDrag(e) {
    e.preventDefault()
    return false
  }

  /**
   * Handle swipe start event (touch/mouse)
   * Records the initial X position of the pointer
   */
  #swipeStart(e) {
    this.#isDragging = true
    this.#startPosX = e instanceof MouseEvent ? e.pageX : e.changedTouches[0].pageX
  }

  /**
   * Handle swipe end event (touch/mouse)
   * Calculates swipe direction based on distance and triggers navigation
   */
  #swipeEnd(e) {
    if (!this.#isDragging) return

    this.#endPosX = e instanceof MouseEvent ? e.pageX : e.changedTouches[0].pageX
    this.#isDragging = false

    const swipeDistance = this.#endPosX - this.#startPosX
    if (swipeDistance > this.#swipeThreshold) this.prev()
    if (swipeDistance < -this.#swipeThreshold) this.next()
  }

  /**
   * Handle mouse leave event
   * Cancels the swipe when mouse leaves the element
   */
  #mouseLeave() {
    this.#isDragging = false
  }

  /* ========== PUBLIC API ========== */

  /**
   * Initialize the carousel with swipe support
   * Extends parent init() method with touch/mouse event listeners
   */
  init() {
    super.init()

    // Запобігання стандартному перетягуванню
    this.container.addEventListener('dragstart', this.#preventDrag)

    // Додаємо обробники подій для свайпу
    this.container.addEventListener('touchstart', this.#swipeStart.bind(this), { passive: true })
    this.slidesContainer.addEventListener('mousedown', this.#swipeStart.bind(this))
    this.container.addEventListener('touchend', this.#swipeEnd.bind(this))
    this.slidesContainer.addEventListener('mouseup', this.#swipeEnd.bind(this))

    // Обробляємо вихід курсора за межі елемента
    this.slidesContainer.addEventListener('mouseleave', this.#mouseLeave.bind(this))
  }
}

export default SwipeCarousel
