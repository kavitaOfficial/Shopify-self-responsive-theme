// document.querySelectorAll('.promo-bar[data-rotate="true"]').forEach(bar => {
//   const items = bar.querySelectorAll('.promo-bar__item');
//   const interval = Number(bar.dataset.interval) || 3000;

//   let index = 0;

//   setInterval(() => {
//     items[index].hidden = true;
//     index = (index + 1) % items.length;
//     items[index].hidden = false;
//   }, interval);
// });


class UniversalSlider {
  constructor(root) {
    this.root = root;
    this.track = root.querySelector('.u-slider-track');
    this.slides = [...root.querySelectorAll('[data-slide]')];
    this.index = 0;

    this.autoplay = root.dataset.autoplay === 'true';
    this.interval = Number(root.dataset.interval) || 5000;
    this.timer = null;

    root.querySelector('.prev')?.addEventListener('click', () => this.prev());
    root.querySelector('.next')?.addEventListener('click', () => this.next());

    root.addEventListener('slider:pause', () => this.pause());
    root.addEventListener('slider:play', () => this.play());

    this.update();
    if (this.autoplay) this.play();
  }

  update() {
    this.track.style.transform = `translateX(-${this.index * 100}%)`;
  }

  next() {
    this.index = (this.index + 1) % this.slides.length;
    this.update();
  }

  prev() {
    this.index =
      (this.index - 1 + this.slides.length) % this.slides.length;
    this.update();
  }

  play() {
    this.pause();
    this.timer = setInterval(() => this.next(), this.interval);
  }

  pause() {
    clearInterval(this.timer);
  }

  goToBlock(blockId) {
    const idx = this.slides.findIndex(
      slide => slide.dataset.blockId === blockId
    );
    if (idx !== -1) {
      this.index = idx;
      this.update();
    }
  }
}

/* INIT */
document.querySelectorAll('[data-slider]').forEach(slider => {
  slider._instance = new UniversalSlider(slider);
});

/* 🔥 SHOPIFY THEME EDITOR SUPPORT */
document.addEventListener('shopify:block:select', (e) => {
  const slider = document.querySelector('[data-slider]');
  if (!slider) return;
  slider._instance.pause();
  slider._instance.goToBlock(e.detail.blockId);
});

document.addEventListener('shopify:block:deselect', () => {
  document.querySelectorAll('[data-slider]').forEach(slider => {
    slider._instance.play();
  });
});
