const cloud = document.getElementById('particleCloud');
if (cloud) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 240; i++) {
    const angle = i * 2.399963229728653;
    const y = 1 - (i / 239) * 2;
    const ring = Math.sqrt(1 - y * y);
    const el = document.createElement('i');
    el.className = 'particle';
    const x = 50 + ring * Math.cos(angle) * 24;
    const top = 50 + y * 37;
    const size = 1 + (i % 6) * 0.48;
    el.style.cssText = `left:${x}%;top:${top}%;width:${size}px;height:${size}px;opacity:${0.35 + (i % 7) * 0.075};`;
    fragment.appendChild(el);
  }
  cloud.appendChild(fragment);
}
document.getElementById('year').textContent = new Date().getFullYear();
