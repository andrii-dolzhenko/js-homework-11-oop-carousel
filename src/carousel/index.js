/**
 * Carousel Module
 * @description Exports carousel components with different functionality
 */

// Basic carousel with core functionality
export { default as Carousel } from './core.js'

// Enhanced carousel with touch/swipe support
export { default as SwipeCarousel } from './swipe.js'

// Default export is the SwipeCarousel which has all functionality
export { default } from './swipe.js'

// Альтернативний варіант експорту для простішої реалізації каруселі:
// Експортуємо обидва класи з одного файлу, щоб зменшити кількість імпортів у проєкті.
// Іменований експорт (Carousel, SwipeCarousel) дає змогу явно звертатися до потрібного компонента,
// а експорт за замовчуванням (SwipeCarousel) спрощує імпорт для найпоширенішого сценарію використання.
// export { Carousel, SwipeCarousel };
// export default SwipeCarousel;
