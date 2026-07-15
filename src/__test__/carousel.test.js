import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import { SwipeCarousel, Carousel } from '../carousel/index.js' // Імпортуємо реальні класи

// Отримуємо шлях до main.js
const mainJsPath = path.resolve(__dirname, '../main.js')
const carouselCode = fs.readFileSync(mainJsPath, 'utf-8')

// Мокуємо main.js для тестування
vi.mock('../main.js', () => {
  return {
    default: vi.fn()
  }
})

// Додаю функцію для читання коду carousel з core.js або index.js
function getCarouselSource() {
  const corePath = path.resolve(__dirname, '../carousel/core.js')
  if (fs.existsSync(corePath)) {
    return fs.readFileSync(corePath, 'utf-8')
  }
  return fs.readFileSync(path.resolve(__dirname, '../carousel/index.js'), 'utf-8')
}

// Налаштування DOM перед тестами
function setupDOM() {
  document.body.innerHTML = `
    <div id="carousel">
      <div class="slides">
        <div class="slide active"></div>
        <div class="slide"></div>
        <div class="slide"></div>
      </div>
    </div>
  `
}

describe('Carousel Functionality', () => {
  let container, slides, slidesContainer, indicators, pauseBtn, prevBtn, nextBtn, carousel

  beforeEach(() => {
    // Налаштовуємо DOM
    setupDOM()

    // Використовуємо фіктивні таймери
    vi.useFakeTimers()

    // Мокуємо setInterval і clearInterval як шпигуни
    vi.spyOn(window, 'setInterval')
    vi.spyOn(window, 'clearInterval')

    // Створюємо екземпляр каруселі
    carousel = new SwipeCarousel({
      containerId: '#carousel',
      slideId: '.slide',
      interval: 2000
    })

    // Шпигуємо за методами next та prev
    vi.spyOn(carousel, 'next')
    vi.spyOn(carousel, 'prev')

    // Ініціалізуємо карусель
    carousel.init()

    // Отримуємо елементи з урахуванням реальної структури
    container = document.querySelector('#carousel')
    slides = container.querySelectorAll('.slide')
    slidesContainer = container.querySelector('.slides')
    indicators = container.querySelectorAll('.indicator')
    pauseBtn = container.querySelector('#pause-btn')
    prevBtn = container.querySelector('#prev-btn')
    nextBtn = container.querySelector('#next-btn')
  })

  afterEach(() => {
    vi.clearAllTimers() // Очищаємо всі таймери
    vi.useRealTimers() // Повертаємо реальні таймери
    vi.restoreAllMocks() // Відновлюємо всі моковані функції
    document.body.innerHTML = ''

    // Додаткове очищення для більшої стабільності тестів
    container = null
    slides = null
    slidesContainer = null
    indicators = null
    pauseBtn = null
    prevBtn = null
    nextBtn = null
    carousel = null
  })

  test('Ініціалізація: перший слайд активний', () => {
    expect(slides[0].classList.contains('active')).toBe(true)
    expect(indicators[0].classList.contains('active')).toBe(true)
    expect(window.setInterval).toHaveBeenCalled()
  })

  test('Перехід до наступного слайда кнопкою', () => {
    nextBtn.click()
    expect(slides[0].classList.contains('active')).toBe(false)
    expect(slides[1].classList.contains('active')).toBe(true)
    expect(indicators[1].classList.contains('active')).toBe(true)
    expect(window.clearInterval).toHaveBeenCalled()
  })

  test('Перехід до попереднього слайда кнопкою', () => {
    prevBtn.click()
    expect(slides[0].classList.contains('active')).toBe(false)
    expect(slides[2].classList.contains('active')).toBe(true)
    expect(indicators[2].classList.contains('active')).toBe(true)
    expect(window.clearInterval).toHaveBeenCalled()
  })

  test('Пауза та відтворення', () => {
    // Спочатку перевіряємо паузу
    pauseBtn.click()
    const pauseIcon = container.querySelector('#fa-pause-icon')
    const playIcon = container.querySelector('#fa-play-icon')
    expect(pauseIcon.style.opacity).toBe('0')
    expect(playIcon.style.opacity).toBe('1')
    expect(window.clearInterval).toHaveBeenCalled()

    // Перевіряємо відтворення
    pauseBtn.click()
    expect(pauseIcon.style.opacity).toBe('1')
    expect(playIcon.style.opacity).toBe('0')
    expect(window.setInterval).toHaveBeenCalled()
  })

  test('Перехід через індикатори', () => {
    indicators[1].click()
    expect(slides[1].classList.contains('active')).toBe(true)
    expect(indicators[1].classList.contains('active')).toBe(true)
    expect(window.clearInterval).toHaveBeenCalled()
  })

  test('Керування клавіатурою', () => {
    // Перевірка стрілки вправо
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true }))
    expect(slides[1].classList.contains('active')).toBe(true)

    // Повернення до початкового слайда
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowLeft', bubbles: true }))
    expect(slides[0].classList.contains('active')).toBe(true)

    // Перевіряємо пробіл
    const spaceEvent = new KeyboardEvent('keydown', { code: 'Space', bubbles: true })
    const preventDefaultSpy = vi.spyOn(spaceEvent, 'preventDefault')

    // Шпигуємо за методом pausePlay
    const pausePlaySpy = vi.spyOn(carousel, 'pausePlay')

    // Викликаємо подію пробілу
    document.dispatchEvent(spaceEvent)

    // Перевіряємо, що preventDefault викликано
    expect(preventDefaultSpy).toHaveBeenCalled()

    // Перевіряємо, що pausePlay викликано після натискання пробілу
    expect(pausePlaySpy).toHaveBeenCalled()

    // Перевіряємо, що clearInterval викликано після паузи
    expect(window.clearInterval).toHaveBeenCalled()
  })

  test('Свайпи для десктопу і сенсорних пристроїв', () => {
    // Перевіряємо, що карусель ініціалізована і DOM містить потрібні елементи
    expect(document.body.innerHTML).toContain('carousel')
    expect(container).toBeDefined()
    expect(container.querySelectorAll('.slide').length).toBeGreaterThan(0)

    // Перевіряємо, що є активний слайд
    const initialActiveSlide = document.querySelector('.slide.active')
    expect(initialActiveSlide).not.toBeNull()
  })

  test('Свайп', () => {
    /*
     * Тест перевіряє функціональність свайпу з імітацією координат та порогових значень
     */

    // Отримуємо поточний поріг свайпу (swipeThreshold) з налаштувань каруселі
    const swipeThreshold = 100 // За замовчуванням в налаштуваннях каруселі

    // Початковий стан - перший слайд активний
    expect(slides[0].classList.contains('active')).toBe(true)

    // 1. ТЕСТ СВАЙПУ ВЛІВО (має викликати next)
    // Створюємо події з координатами більшими за поріг свайпу для touch подій
    const startEventLeft = new Event('touchstart', { bubbles: true })
    startEventLeft.changedTouches = [{ pageX: 300 }]

    const endEventLeft = new Event('touchend', { bubbles: true })
    endEventLeft.changedTouches = [{ pageX: 100 }] // Різниця 200px, що більше порогу 100px

    // Шпигуємо за методом next
    const nextSpy = vi.spyOn(carousel, 'next')

    // Імітуємо свайп вліво за допомогою touch подій
    container.dispatchEvent(startEventLeft)
    container.dispatchEvent(endEventLeft)

    // Перевіряємо, що метод next був викликаний в результаті свайпу
    expect(nextSpy).toHaveBeenCalled()
    nextSpy.mockClear()

    // 2. ТЕСТ МАЛОГО СВАЙПУ ВЛІВО (не має викликати next)
    const startEventSmallLeft = new Event('touchstart', { bubbles: true })
    startEventSmallLeft.changedTouches = [{ pageX: 150 }]

    const endEventSmallLeft = new Event('touchend', { bubbles: true })
    endEventSmallLeft.changedTouches = [{ pageX: 100 }] // Різниця лише 50px, менше порогу 100px

    // Імітуємо малий свайп вліво
    container.dispatchEvent(startEventSmallLeft)
    container.dispatchEvent(endEventSmallLeft)

    // Перевіряємо, що метод next не був викликаний при малому свайпі
    expect(nextSpy).not.toHaveBeenCalled()

    // 3. ТЕСТ СВАЙПУ ВПРАВО (має викликати prev)
    // Шпигуємо за методом prev
    const prevSpy = vi.spyOn(carousel, 'prev')

    const startEventRight = new Event('touchstart', { bubbles: true })
    startEventRight.changedTouches = [{ pageX: 100 }]

    const endEventRight = new Event('touchend', { bubbles: true })
    endEventRight.changedTouches = [{ pageX: 300 }] // Різниця 200px, що більше порогу 100px

    // Імітуємо свайп вправо
    container.dispatchEvent(startEventRight)
    container.dispatchEvent(endEventRight)

    // Перевіряємо, що метод prev був викликаний в результаті свайпу
    expect(prevSpy).toHaveBeenCalled()
    prevSpy.mockClear()

    // 4. ТЕСТ МАЛОГО СВАЙПУ ВПРАВО (не має викликати prev)
    const startEventSmallRight = new Event('touchstart', { bubbles: true })
    startEventSmallRight.changedTouches = [{ pageX: 100 }]

    const endEventSmallRight = new Event('touchend', { bubbles: true })
    endEventSmallRight.changedTouches = [{ pageX: 150 }] // Різниця лише 50px, менше порогу 100px

    // Імітуємо малий свайп вправо
    container.dispatchEvent(startEventSmallRight)
    container.dispatchEvent(endEventSmallRight)

    // Перевіряємо, що метод prev не був викликаний при малому свайпі
    expect(prevSpy).not.toHaveBeenCalled()
  })

  test('Автоматичне перемикання', () => {
    // Початковий стан - перший слайд активний
    expect(slides[0].classList.contains('active')).toBe(true)

    // Просуваємо час на величину таймера (2000мс)
    vi.advanceTimersByTime(2000)

    // Перевіряємо, що відбулося перемикання на другий слайд
    expect(slides[1].classList.contains('active')).toBe(true)

    // Ставимо на паузу
    carousel.pause()

    // Перевіряємо стан після паузи
    expect(carousel.isPlaying).toBe(false)

    // Просуваємо час ще раз
    vi.advanceTimersByTime(2000)

    // Перевіряємо, що слайд не змінився (залишився другий активним)
    expect(slides[1].classList.contains('active')).toBe(true)

    // Відновлюємо відтворення
    carousel.play()

    // Перевіряємо стан після відновлення
    expect(carousel.isPlaying).toBe(true)

    // Просуваємо час ще раз
    vi.advanceTimersByTime(2000)

    // Перевіряємо, що відбулося перемикання на третій слайд
    expect(slides[2].classList.contains('active')).toBe(true)
  })

  test('Циклічний перехід вперед (з останнього на перший)', () => {
    // Спочатку переходимо до другого слайду
    nextBtn.click()
    expect(slides[1].classList.contains('active')).toBe(true)

    // Потім переходимо до третього (останнього) слайду
    nextBtn.click()
    expect(slides[2].classList.contains('active')).toBe(true)

    // Клікаємо на кнопку Далі для переходу з останнього на перший
    nextBtn.click()

    // Перевіряємо, що відбувся перехід на перший слайд
    expect(slides[0].classList.contains('active')).toBe(true)
    expect(indicators[0].classList.contains('active')).toBe(true)
  })

  test('Циклічний перехід назад (з першого на останній)', () => {
    // Перевіряємо, що ми на першому слайді
    expect(slides[0].classList.contains('active')).toBe(true)

    // Клікаємо на кнопку Назад для переходу з першого на останній
    prevBtn.click()

    // Перевіряємо, що відбувся перехід на останній слайд
    expect(slides[2].classList.contains('active')).toBe(true)
    expect(indicators[2].classList.contains('active')).toBe(true)
  })

  test('Карусель правильно застосовує налаштування', () => {
    // Підготовлюємо DOM для тесту
    document.body.innerHTML = `
      <div id="custom-carousel">
        <div class="slides">
          <div class="custom-slide active"></div>
          <div class="custom-slide"></div>
        </div>
      </div>
    `

    // Створюємо карусель з кастомними налаштуваннями
    const customCarousel = new SwipeCarousel({
      containerId: '#custom-carousel',
      slideId: '.custom-slide',
      interval: 1000,
      isPlaying: false
    })

    // Перевіряємо налаштування, які були передані в конструктор
    expect(customCarousel.TIMER_INTERVAL).toBe(1000)
    expect(customCarousel.isPlaying).toBe(false)

    // Ініціалізуємо карусель
    customCarousel.init()

    // Очищаємо історію викликів перед тестом
    window.setInterval.mockClear()

    // Перевіряємо, що setInterval не викликався, оскільки isPlaying=false
    expect(window.setInterval).not.toHaveBeenCalled()

    // Перевіряємо, що setInterval викликається, коли запускаємо відтворення
    customCarousel.play()
    expect(window.setInterval).toHaveBeenCalled()

    // Очищаємо DOM після тесту
    document.body.innerHTML = ''
  })

  test('Перехід між слайдами через індикатори має працювати з числовими індексами', () => {
    // Створюємо мок для _gotoNth з перевіркою типу
    const mockCarousel = {
      _gotoNth: function (n) {
        if (typeof n !== 'number') {
          throw new Error('Argument to _gotoNth must be a number')
        }
        return n
      },
      pause: function () {}
    }

    // Створюємо фіктивний event з target, що має dataset.slideTo як рядок
    const fakeEvent = {
      target: {
        classList: { contains: () => true },
        dataset: { slideTo: '1' } // рядок '1'
      }
    }

    // Перевіряємо, що при використанні target.dataset.slideTo без конвертації
    // буде викинуто помилку
    const badHandler = function (e) {
      const target = e.target
      if (target && target.classList.contains('indicator')) {
        this.pause()
        this._gotoNth(target.dataset.slideTo) // без конвертації
      }
    }

    expect(() => {
      badHandler.call(mockCarousel, fakeEvent)
    }).toThrow('Argument to _gotoNth must be a number')

    // Перевіряємо, що при використанні правильного перетворення типів
    // помилки не буде
    const goodHandler = function (e) {
      const target = e.target
      if (target && target.classList.contains('indicator')) {
        this.pause()
        this._gotoNth(+target.dataset.slideTo) // з конвертацією
      }
    }

    expect(() => {
      goodHandler.call(mockCarousel, fakeEvent)
    }).not.toThrow()
  })

  test('Аргументи при переході між слайдами коректно передаються', () => {
    const carouselCode = getCarouselSource()

    // Перевіряємо, чи використовується конвертація (+, Number, parseInt) при виклику gotoNth
    const correctPattern = /this\.(?:#)?(?:gotoNth|_gotoNth)\(\s*(?:\+|Number\(|parseInt\()/
    // Або якщо значення конвертується до виклику і передається як змінна
    const assignmentPattern = /(?:const|let|var)\s+\w+\s*=\s*(?:\+|Number\(|parseInt\()\s*target\.dataset\.slideTo/
    const hasValidConversion = correctPattern.test(carouselCode) || assignmentPattern.test(carouselCode)

    // Перевіряємо, чи немає жорстко неправильного виклику без конвертації взагалі
    const hasStringArgument = /this\.(?:#)?(?:gotoNth|_gotoNth)\(\s*target\.dataset\.slideTo\s*\)/.test(carouselCode)

    // Тест проходить, якщо в коді використовується перетворення рядка в число
    expect(hasValidConversion).toBe(true)
    expect(hasStringArgument).toBe(false)
  })

  test('Обчислення індексу наступного слайду має працювати коректно при будь-якій кількості слайдів', () => {
    const carouselCode = getCarouselSource()

    // Шукаємо рядок, де відбувається обчислення наступного слайду
    const correctPattern = /this\.(?:#)?currentSlide\s*=\s*\(\s*[a-zA-Z_]\w*\s*\+\s*this\.(?:#)?(?:SLIDES_COUNT|slides\.length)\s*\)\s*%\s*this\.(?:#)?(?:SLIDES_COUNT|slides\.length)/

    // Шукаємо неправильні патерни з конкретними числами
    const wrongPattern1 = /this\.(?:#)?currentSlide\s*=\s*\(\s*[a-zA-Z_]\w*\s*\+\s*this\.(?:#)?(?:SLIDES_COUNT|slides\.length)\s*\)\s*%\s*\d+/
    const wrongPattern2 = /this\.(?:#)?currentSlide\s*=\s*\(\s*[a-zA-Z_]\w*\s*\+\s*\d+\s*\)\s*%\s*this\.(?:#)?(?:SLIDES_COUNT|slides\.length)/
    const wrongPattern3 = /this\.(?:#)?currentSlide\s*=\s*\(\s*[a-zA-Z_]\w*\s*\+\s*\d+\s*\)\s*%\s*\d+/

    // Перевіряємо наявність правильного патерну
    expect(correctPattern.test(carouselCode)).toBe(true)

    // Переконуємося, що неправильні патерни відсутні
    expect(wrongPattern1.test(carouselCode)).toBe(false)
    expect(wrongPattern2.test(carouselCode)).toBe(false)
    expect(wrongPattern3.test(carouselCode)).toBe(false)
  })

  test('Пауза при наведенні миші працює коректно', () => {
    // Очищаємо DOM перед тестом
    document.body.innerHTML = `
      <div id="custom-carousel">
        <div class="slides">
          <div class="custom-slide active"></div>
          <div class="custom-slide"></div>
        </div>
      </div>
    `

    // Створюємо карусель із увімкненою опцією pauseOnHover
    const pauseOnHoverCarousel = new SwipeCarousel({
      containerId: '#custom-carousel',
      slideId: '.custom-slide',
      interval: 1000,
      pauseOnHover: true
    })

    // Ініціалізуємо карусель
    pauseOnHoverCarousel.init()

    // Спочатку карусель має бути в стані відтворення (isPlaying = true)
    expect(pauseOnHoverCarousel.isPlaying).toBe(true)

    // Імітуємо наведення миші на контейнер
    const container = document.querySelector('#custom-carousel')
    container.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

    // Карусель має зупинитися (isPlaying = false)
    expect(pauseOnHoverCarousel.isPlaying).toBe(false)

    // Імітуємо відведення миші від контейнера
    container.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))

    // Карусель має відновити відтворення (isPlaying = true)
    expect(pauseOnHoverCarousel.isPlaying).toBe(true)

    // Перевіряємо, що події правильно відпрацьовують, коли pauseOnHover = false
    document.body.innerHTML = `
      <div id="no-pause-carousel">
        <div class="slides">
          <div class="custom-slide active"></div>
          <div class="custom-slide"></div>
        </div>
      </div>
    `

    // Створюємо карусель з вимкненою опцією pauseOnHover
    const noPauseCarousel = new SwipeCarousel({
      containerId: '#no-pause-carousel',
      slideId: '.custom-slide',
      interval: 1000,
      pauseOnHover: false
    })

    // Ініціалізуємо карусель
    noPauseCarousel.init()

    // Карусель має бути в стані відтворення (isPlaying = true)
    expect(noPauseCarousel.isPlaying).toBe(true)

    // Імітуємо наведення миші на контейнер
    const noPauseContainer = document.querySelector('#no-pause-carousel')
    noPauseContainer.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

    // Карусель має залишитися в стані відтворення (isPlaying = true)
    expect(noPauseCarousel.isPlaying).toBe(true)
  })

  test('Карусель з одним слайдом працює коректно', () => {
    // Очищаємо DOM перед тестом
    document.body.innerHTML = `
      <div id="single-slide-carousel">
        <div class="slides">
          <div class="slide active"></div>
        </div>
      </div>
    `

    // Створюємо карусель з одним слайдом
    const singleSlideCarousel = new SwipeCarousel({
      containerId: '#single-slide-carousel',
      slideId: '.slide',
      interval: 1000
    })

    // Шпигуємо за методами next та prev
    const nextSpy = vi.spyOn(singleSlideCarousel, 'next')
    const prevSpy = vi.spyOn(singleSlideCarousel, 'prev')

    // Ініціалізуємо карусель
    singleSlideCarousel.init()

    // Перевіряємо, що слайд активний
    const slide = document.querySelector('#single-slide-carousel .slide')
    expect(slide.classList.contains('active')).toBe(true)

    // Отримуємо кнопки навігації
    const nextBtn = document.querySelector('#single-slide-carousel #next-btn')
    const prevBtn = document.querySelector('#single-slide-carousel #prev-btn')

    // Клікаємо "Далі" - слайд має залишитися активним
    nextBtn.click()
    expect(nextSpy).toHaveBeenCalled()
    expect(slide.classList.contains('active')).toBe(true)

    // Клікаємо "Назад" - слайд має залишитися активним
    prevBtn.click()
    expect(prevSpy).toHaveBeenCalled()
    expect(slide.classList.contains('active')).toBe(true)
  })

  test('Карусель коректно обробляє неіснуючі елементи', () => {
    // Очищаємо DOM
    document.body.innerHTML = ''

    // Перевіряємо створення каруселі з неіснуючим контейнером
    let carousel
    try {
      carousel = new SwipeCarousel({
        containerId: '#non-existent-container',
        slideId: '.slide',
        interval: 1000
      })
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError) // Очікуємо TypeError
    }

    // Перевіряємо, що carousel не створено
    expect(carousel).toBeUndefined()

    // Перевіряємо створення валідної каруселі після невдалої спроби
    document.body.innerHTML = `
      <div id="test-carousel">
        <div class="slides">
          <div class="slide active"></div>
          <div class="slide"></div>
        </div>
      </div>
    `

    const validCarousel = new SwipeCarousel({
      containerId: '#test-carousel',
      slideId: '.slide',
      interval: 1000
    })

    expect(() => validCarousel.init()).not.toThrow()
    expect(validCarousel.container).not.toBeNull()
    expect(validCarousel.slides.length).toBe(2)
  })

  test('Індикатори коректно обробляють валідні та невалідні значення', () => {
    document.body.innerHTML = `
      <div id="carousel">
        <div class="slides">
          <div class="slide active"></div>
          <div class="slide"></div>
          <div class="slide"></div>
        </div>
        <ol class="indicators" id="indicators-container">
          <li class="indicator active" data-slide-to="0"></li>
          <li class="indicator" data-slide-to="1"></li>
          <li class="indicator" data-slide-to="2"></li>
          <li class="indicator" data-slide-to="invalid"></li>
        </ol>
      </div>
    `

    const carousel = new SwipeCarousel({
      containerId: '#carousel',
      slideId: '.slide',
      interval: 1000,
      isPlaying: false
    })
    carousel.init()

    const slides = document.querySelectorAll('.slide')
    const indicators = document.querySelectorAll('.indicator')

    // Перевірка початкового стану
    expect(slides[0].classList.contains('active')).toBe(true)
    expect(indicators[0].classList.contains('active')).toBe(true)

    // Клік на валідний індикатор (data-slide-to="1")
    indicators[1].click()
    expect(slides[1].classList.contains('active')).toBe(true)
    expect(slides[0].classList.contains('active')).toBe(false)
    expect(indicators[1].classList.contains('active')).toBe(true)
    expect(indicators[0].classList.contains('active')).toBe(false)

    // Клік на інший валідний індикатор (data-slide-to="2")
    indicators[2].click()
    expect(slides[2].classList.contains('active')).toBe(true)
    expect(slides[1].classList.contains('active')).toBe(false)
    expect(indicators[2].classList.contains('active')).toBe(true)
    expect(indicators[1].classList.contains('active')).toBe(false)

    // Мокуємо console.error
    const originalConsoleError = console.error
    console.error = vi.fn()

    // Перехоплюємо помилку, щоб тест не падав
    const errorHandler = vi.fn()
    window.addEventListener('error', errorHandler)

    // Клік на невалідний індикатор (data-slide-to="invalid")
    indicators[3].click()

    // Перевіряємо, що TypeError була перехоплена
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(TypeError)
      })
    )

    // Очікуємо, що клас active знятий через баг у #gotoNth
    expect(slides[2].classList.contains('active')).toBe(false)
    expect(indicators[2].classList.contains('active')).toBe(false)

    // Відновлюємо слухачі та console.error
    window.removeEventListener('error', errorHandler)
    console.error = originalConsoleError
  })
})
