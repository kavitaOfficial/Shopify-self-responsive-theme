document.querySelectorAll('.promo-bar[data-rotate="true"]').forEach(bar => {
  const items = bar.querySelectorAll('.promo-bar__item');
  const interval = Number(bar.dataset.interval) || 3000;

  let index = 0;

  setInterval(() => {
    items[index].hidden = true;
    index = (index + 1) % items.length;
    items[index].hidden = false;
  }, interval);
});