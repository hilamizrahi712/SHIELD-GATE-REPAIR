/* Shield Gate Repair — main.js */

document.addEventListener('DOMContentLoaded', function () {

  /* ---- Mobile menu ---- */
  var btn = document.getElementById('mobileMenuBtn');
  var menu = document.getElementById('navMenu');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      btn.classList.toggle('open');
      menu.classList.toggle('open');
    });
    document.querySelectorAll('.has-dropdown > a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          this.closest('.has-dropdown').classList.toggle('open');
        }
      });
    });
    document.querySelectorAll('.nav-menu a:not(.dropdown-toggle)').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          btn.classList.remove('open');
          menu.classList.remove('open');
        }
      });
    });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-question').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = this.closest('.faq-item');
      var wasOpen = item.classList.contains('active');
      document.querySelectorAll('.faq-item.active').forEach(function (i) { i.classList.remove('active'); });
      if (!wasOpen) item.classList.add('active');
    });
  });

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---- Gallery lightbox ---- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightboxImg');
  var galleryItems = document.querySelectorAll('.gallery-item');
  var currentIndex = 0;
  var imgs = [];
  galleryItems.forEach(function (item, i) {
    var img = item.querySelector('img');
    if (img) imgs.push(img.src);
    item.addEventListener('click', function () {
      currentIndex = i;
      if (lightbox && lbImg) { lbImg.src = imgs[i]; lightbox.classList.add('active'); }
    });
  });
  if (lightbox) {
    var lbClose = document.getElementById('lightboxClose');
    var lbPrev = document.getElementById('lightboxPrev');
    var lbNext = document.getElementById('lightboxNext');
    if (lbClose) lbClose.addEventListener('click', function () { lightbox.classList.remove('active'); });
    if (lbPrev) lbPrev.addEventListener('click', function () { currentIndex = (currentIndex - 1 + imgs.length) % imgs.length; lbImg.src = imgs[currentIndex]; });
    if (lbNext) lbNext.addEventListener('click', function () { currentIndex = (currentIndex + 1) % imgs.length; lbImg.src = imgs[currentIndex]; });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) lightbox.classList.remove('active'); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') lightbox.classList.remove('active');
      if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + imgs.length) % imgs.length; lbImg.src = imgs[currentIndex]; }
      if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % imgs.length; lbImg.src = imgs[currentIndex]; }
    });
  }

  /* ---- Brands carousel (infinite auto-scroll) ---- */
  var track = document.querySelector('.brands-carousel-track');
  if (track) {
    // Clone all children for infinite loop
    var origItems = Array.prototype.slice.call(track.children);
    origItems.forEach(function(item) {
      var clone = item.cloneNode(true);
      track.appendChild(clone);
    });

    var pos = 0;
    var speed = 0.6;
    var halfWidth = 0;
    var animId;

    function getHalfWidth() {
      // Width of the original (un-cloned) items
      var total = 0;
      for (var i = 0; i < origItems.length; i++) {
        total += origItems[i].offsetWidth + 24; // 24 = gap
      }
      return total;
    }

    function tick() {
      if (!halfWidth) halfWidth = getHalfWidth();
      pos -= speed;
      if (Math.abs(pos) >= halfWidth) pos = 0;
      track.style.transform = 'translateX(' + pos + 'px)';
      animId = requestAnimationFrame(tick);
    }

    // Pause on hover
    track.parentElement.addEventListener('mouseenter', function() { cancelAnimationFrame(animId); });
    track.parentElement.addEventListener('mouseleave', function() { animId = requestAnimationFrame(tick); });

    animId = requestAnimationFrame(tick);
  }

  /* ---- Formspree forms ---- */
  var FORMSPREE = 'https://formspree.io/f/xykqkqzr';

  document.querySelectorAll('.formspree-form').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var data = new FormData(form);
      var submitBtn = form.querySelector('button[type="submit"]');
      var origText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      fetch(FORMSPREE, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      }).then(function(res) {
        if (res.ok) {
          form.innerHTML = '<div class="form-success"><h3>&#10003; Thank You!</h3><p>We\'ll be in touch within 1 business hour. For immediate help call <a href="tel:+12147354314">+1 (214) 735-4314</a>.</p></div>';
        } else {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
          alert('Something went wrong. Please call us directly at +1 (214) 735-4314.');
        }
      }).catch(function() {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
        alert('Could not connect. Please call us at +1 (214) 735-4314.');
      });
    });
  });

});
