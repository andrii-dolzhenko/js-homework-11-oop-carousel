# CANBY OOP Carousel — Homework 11

A responsive fullscreen product carousel for CANBY Glass Design Studio, built with pure JavaScript. Homework 11 focuses on object-oriented programming, inheritance, dynamic controls, configuration, and swipe support. The project provides class-based and prototype-based implementations in separate branches.

## Project Links

- [Live demo](https://andrii-dolzhenko.github.io/js-homework-11-oop-carousel/)
- [GitHub repository](https://github.com/andrii-dolzhenko/js-homework-11-oop-carousel)
- [Class-based implementation](https://github.com/andrii-dolzhenko/js-homework-11-oop-carousel/tree/classes)
- [Prototype-based implementation](https://github.com/andrii-dolzhenko/js-homework-11-oop-carousel/tree/prototypes)

## Assignment Setup

1. Install the project dependencies:

   ```bash
   npm install
   ```

   The repository also includes `yarn.lock`, so Yarn can be used instead:

   ```bash
   yarn
   ```

   If Yarn is not already available, install it globally first:

   ```bash
   npm i -g yarn
   ```

2. Complete the required JavaScript tasks and run the provided test suite:

   ```bash
   npm test
   ```

   or:

   ```bash
   yarn test
   ```

3. If tests fail, review the reported failures, identify the problem, and correct the implementation. After all tests pass:
   - Take a screenshot of the passing test results as evidence of completion.
   - Upload the project to GitHub.
   - Submit direct links to the relevant JavaScript files.

Vitest watch mode is not used for this assignment. Run tests only through the provided `npm test` or `yarn test` command.

## Implementation Versions

| Branch       | Purpose                               | Architecture                                                      |
| ------------ | ------------------------------------- | ----------------------------------------------------------------- |
| `main`       | Stable primary implementation         | ES6 classes                                                       |
| `classes`    | Explicit class-based homework version | `class`, `extends`, `super()`                                     |
| `prototypes` | Prototype-based homework version      | constructor functions, `.prototype`, `Object.create()`, `.call()` |

The `main` and `classes` branches contain the class-based implementation, while `prototypes` contains the explicit prototype-chain implementation. Both implementations share the same public carousel behavior and visual CANBY interface.

To inspect a specific implementation:

```bash
git switch classes
```

or:

```bash
git switch prototypes
```

## Implemented Requirements

- A base `Carousel` implementation and an extended `SwipeCarousel` implementation.
- ES6 class inheritance in `main` and `classes`; explicit prototype inheritance in `prototypes`.
- Dynamically generated Previous, Next, and Pause/Play controls.
- Dynamically generated slide indicators; the HTML contains no static navigation controls or indicators.
- A configuration object with a configurable autoplay interval, autoplay state, and optional pause on hover.
- Previous and next navigation with cyclic wrapping in both directions.
- Pause/Play behavior and synchronized autoplay state.
- Keyboard controls for `ArrowLeft`, `ArrowRight`, and `Space`.
- Mouse drag and touch swipe navigation.
- Numeric indicator navigation using converted `data-slide-to` values.
- An adaptive layout for desktop, tablet, and mobile viewports.

## Architecture Comparison

Class-based inheritance:

```js
class SwipeCarousel extends Carousel {
  constructor(options) {
    super(options)
  }
}
```

Prototype-based inheritance:

```js
function SwipeCarousel(options) {
  Carousel.call(this, options)
}

SwipeCarousel.prototype = Object.create(Carousel.prototype)

SwipeCarousel.prototype.constructor = SwipeCarousel
```

## Carousel Configuration

The following options are supported by both implementations:

| Option         | Type      | Description                                                    |
| -------------- | --------- | -------------------------------------------------------------- |
| `containerId`  | `string`  | CSS selector for the carousel container.                       |
| `slideId`      | `string`  | CSS selector used to find slides inside the container.         |
| `interval`     | `number`  | Autoplay interval in milliseconds.                             |
| `isPlaying`    | `boolean` | Determines whether autoplay starts during initialization.      |
| `pauseOnHover` | `boolean` | Pauses on mouse enter and resumes on mouse leave when enabled. |

Configuration used by `src/main.js`:

```js
import SwipeCarousel from './carousel/index.js'

const carouselElement = document.querySelector('#carousel')

const carouselConfig = {
  containerId: '#carousel',
  slideId: '.slide',
  interval: Number(carouselElement?.dataset.interval) || 2000,
  isPlaying: true,
  pauseOnHover: false
}

const carousel = new SwipeCarousel(carouselConfig)
carousel.init()
```

Mouse and touch gestures are handled by `SwipeCarousel`; a completed horizontal gesture beyond its internal threshold moves to the previous or next slide.

## Additional CANBY Features

- Synchronized product image, number, collection label, title, description, price, and color tint.
- A fullscreen CANBY presentation with orbit and trailing product composition.
- A lava-style progress bar synchronized with autoplay and Pause/Play state.
- Responsive desktop, tablet, and mobile layouts.
- Accessible control labels, product labels, decorative-element handling, and a polite live content region where applicable.

These are project-specific visual and UX enhancements rather than mandatory teacher requirements.

## Project Structure

```text
.
|-- README.md
|-- package.json
`-- src/
    |-- ASSIGNMENT.md
    |-- _index.html
    |-- main.js
    |-- style.css
    |-- assets/
    |   `-- images/
    |-- carousel/
    |   |-- core.js
    |   |-- swipe.js
    |   |-- index.js
    |   `-- helpers/
    |       `-- config.js
    `-- __test__/
        `-- carousel.test.js
```

## Running the Project

Install dependencies, then serve `src/_index.html` through an IDE local server or another local HTTP server. Do not rely on opening the file directly through `file://`, because the browser may block or mishandle its ES module imports.

The project does not define an `npm start` or `npm run dev` script.

## Running Tests

With npm:

```bash
npm install
npm test
```

With Yarn:

```bash
yarn
yarn test
```

The test suite contains 19 tests. Both implementation branches pass all 19 automated tests. Use the provided non-watch test commands; Vitest watch mode is not used for this assignment.

## Verification

- Vitest: 19/19 tests passed
- HTML validation: passed
- CSS validation: passed
