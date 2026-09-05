// Public website header only: remove any legacy image node that appears in the header.
(() => {
  const cleanHeaderImages = () => {
    const header = document.querySelector('.site-header');
    if (!header) return;
    header.querySelectorAll('img').forEach(img => img.remove());
  };

  cleanHeaderImages();

  const header = document.querySelector('.site-header');
  if (header) {
    new MutationObserver(cleanHeaderImages).observe(header, { childList: true, subtree: true });
  }
})();
