// THREE SEAT dev log: a lightbox, the top bar's "where am I" mark, the film strips' scroll hint. No dependencies.
(function () {
  var imgs = Array.prototype.slice.call(document.querySelectorAll('figure img[data-full]'));
  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-label', 'Picture');
  lb.innerHTML = '<span class="ct"></span><button type="button" class="x" aria-label="Close">CLOSE</button>' +
    '<div class="stage"><img alt=""></div><p></p>' +
    '<button type="button" class="pv" aria-label="Previous picture">&larr;</button><button type="button" class="nx" aria-label="Next picture">&rarr;</button>';
  document.body.appendChild(lb);
  var stage = lb.querySelector('.stage'), big = stage.querySelector('img'), cap = lb.querySelector('p'), ct = lb.querySelector('.ct'), at = -1;

  function show(i) {
    at = (i + imgs.length) % imgs.length;
    var im = imgs[at];
    var w = +im.getAttribute('width'), h = +im.getAttribute('height');
    lb.classList.remove('zoom');
    lb.classList.toggle('tall', h > w * 1.25);   // tall sheets fill the width and scroll
    big.src = im.getAttribute('data-full');
    big.alt = im.alt;
    cap.textContent = im.alt;
    ct.textContent = (at + 1) + ' / ' + imgs.length;
    lb.classList.add('open');
    stage.scrollTop = 0; stage.scrollLeft = 0;
    document.documentElement.style.overflow = 'hidden';
  }
  function hide() {
    lb.classList.remove('open'); big.removeAttribute('src'); at = -1;
    document.documentElement.style.overflow = '';
  }

  imgs.forEach(function (im, i) {
    im.addEventListener('click', function () { show(i); });
    im.tabIndex = 0;
    im.addEventListener('keydown', function (e) { if (e.key === 'Enter') { show(i); } });
  });
  big.addEventListener('click', function (e) {   // a click on the picture: full size and back
    e.stopPropagation();
    var on = lb.classList.toggle('zoom');
    if (on) { stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2; }
  });
  stage.addEventListener('click', hide);
  lb.querySelector('.x').addEventListener('click', hide);
  lb.querySelector('.pv').addEventListener('click', function () { show(at - 1); });
  lb.querySelector('.nx').addEventListener('click', function () { show(at + 1); });
  document.addEventListener('keydown', function (e) {
    if (at < 0) { return; }
    if (e.key === 'Escape') { hide(); }
    if (e.key === 'ArrowRight') { show(at + 1); }
    if (e.key === 'ArrowLeft') { show(at - 1); }
  });

  // film strips: say "scroll" only where there is more than fits
  var strips = Array.prototype.slice.call(document.querySelectorAll('.strip'));
  function mark() {
    strips.forEach(function (s) {
      var r = s.querySelector('.reel');
      s.classList.toggle('more', r.scrollWidth > r.clientWidth + 8);
    });
  }
  mark();
  window.addEventListener('resize', mark);
  window.addEventListener('load', mark);

  // top bar: mark the chapter in view
  var links = Array.prototype.slice.call(document.querySelectorAll('.bar nav a'));
  if ('IntersectionObserver' in window && links.length) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        links.forEach(function (a) { a.classList.remove('on'); });
        var a = byId[e.target.id];
        if (a) { a.classList.add('on'); var n = a.parentNode; n.scrollLeft = a.offsetLeft - n.clientWidth / 2 + a.clientWidth / 2; }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) { io.observe(s); } });
  }
})();
