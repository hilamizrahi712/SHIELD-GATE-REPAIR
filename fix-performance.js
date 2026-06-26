/**
 * Performance fixes:
 * 1. Compress large images with sharp
 * 2. Replace city map iframes with .map-wrapper divs
 * 3. Add loading="lazy" to img tags missing it
 * 4. Add map-wrapper + Intersection Observer CSS/JS
 * 5. Bump CSS to v=10
 */

const fs   = require('fs');
const path = require('path');
const sharp = require('sharp');
const ROOT = path.resolve(__dirname);

/* ── 1. Compress images over 200KB ── */
async function compressImages() {
  console.log('\n[COMPRESS] Compressing large images...');
  const galleryDir = path.join(ROOT, 'images', 'gallery');
  const files = fs.readdirSync(galleryDir);
  let count = 0;

  for (const f of files) {
    if (!/\.(jpe?g|png)$/i.test(f)) continue;
    const fp = path.join(galleryDir, f);
    const size = fs.statSync(fp).size;
    if (size <= 200 * 1024) continue; // skip if under 200KB

    const quality = 78;
    const tmp = fp + '.tmp';
    try {
      await sharp(fp).jpeg({ quality, mozjpeg: true }).toFile(tmp);
      const newSize = fs.statSync(tmp).size;
      fs.renameSync(tmp, fp);
      console.log(`  ${f}: ${Math.round(size/1024)}KB → ${Math.round(newSize/1024)}KB`);
      count++;
    } catch (e) {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      console.log(`  WARN: could not compress ${f}: ${e.message}`);
    }
  }
  console.log(`  Compressed ${count} images.`);
}

/* ── 2. Replace map iframes with .map-wrapper in all city pages ── */
function fixCityMaps() {
  console.log('\n[MAPS] Replacing map iframes with lazy wrappers...');
  const citiesDir = path.join(ROOT, 'cities');
  let count = 0;

  fs.readdirSync(citiesDir).forEach(f => {
    if (!f.endsWith('.html')) return;
    const fp = path.join(citiesDir, f);
    let html = fs.readFileSync(fp, 'utf8');

    // Match the iframe block inside the map container
    // Capture the src URL from the iframe
    const iframeRegex = /<iframe\s[\s\S]*?src="(https:\/\/maps\.google\.com[^"]+)"[\s\S]*?<\/iframe>/;
    const match = html.match(iframeRegex);
    if (!match) { console.log(`  skip ${f} (no map iframe)`); return; }

    const mapSrc = match[1];
    const wrapperDiv = `<div class="map-wrapper" data-src="${mapSrc}"></div>`;
    html = html.replace(iframeRegex, wrapperDiv);

    fs.writeFileSync(fp, html);
    count++;
  });
  console.log(`  Replaced map iframes in ${count} city pages.`);
}

/* ── 3. Add loading="lazy" to img tags missing it ── */
function addLazyLoading() {
  console.log('\n[LAZY] Adding loading="lazy" to images missing it...');
  const dirs = [ROOT, 'cities', 'brands', 'services'].map(d => path.join(ROOT, d));
  let total = 0;

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
      if (!f.endsWith('.html')) return;
      const fp = path.join(dir, f);
      let html = fs.readFileSync(fp, 'utf8');
      const before = html;

      // Add loading="lazy" to <img tags that don't have it and aren't nav/logo
      // Only target gallery/testimonial images (src contains images/)
      html = html.replace(/<img([^>]*src="[^"]*images\/[^"]*")([^>]*)>/g, (m, attrs1, attrs2) => {
        if (m.includes('loading=')) return m; // already has loading attr
        return `<img${attrs1}${attrs2} loading="lazy">`;
      });

      if (html !== before) {
        fs.writeFileSync(fp, html);
        total++;
      }
    });
  });
  console.log(`  Updated ${total} files with lazy loading.`);
}

/* ── 4. Add map-wrapper CSS to style.css ── */
function addMapCSS() {
  console.log('\n[CSS] Adding map-wrapper styles...');
  const cssPath = path.join(ROOT, 'css', 'style.css');
  let css = fs.readFileSync(cssPath, 'utf8');
  if (css.includes('.map-wrapper')) { console.log('  already present, skipping.'); return; }

  css += `\n/* ── Lazy map wrapper ── */\n.map-wrapper{width:100%;height:100%;min-height:360px;background:var(--off-white);display:flex;align-items:center;justify-content:center;overflow:hidden}\n.map-wrapper::before{content:'Loading map\\2026';color:var(--gray);font-size:.88rem;font-family:inherit}\n.map-wrapper iframe{width:100%;height:100%;min-height:360px;border:0;display:block}\n`;
  fs.writeFileSync(cssPath, css);
  console.log('  Map-wrapper CSS added.');
}

/* ── 5. Add Intersection Observer to main.js ── */
function addMapObserver() {
  console.log('\n[JS] Adding Intersection Observer for maps...');
  const jsPath = path.join(ROOT, 'js', 'main.js');
  let js = fs.readFileSync(jsPath, 'utf8');
  if (js.includes('map-wrapper')) { console.log('  already present, skipping.'); return; }

  const observer = `
/* ---- Lazy-load map iframes via Intersection Observer ---- */
(function() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.map-wrapper').forEach(function(w) {
      var iframe = document.createElement('iframe');
      iframe.src = w.dataset.src;
      iframe.style.cssText = 'width:100%;height:100%;min-height:360px;border:0;display:block';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      w.appendChild(iframe);
    });
    return;
  }
  var mapObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var w = entry.target;
      var iframe = document.createElement('iframe');
      iframe.src = w.dataset.src;
      iframe.style.cssText = 'width:100%;height:100%;min-height:360px;border:0;display:block';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      w.appendChild(iframe);
      mapObs.unobserve(w);
    });
  }, { rootMargin: '200px' });
  document.querySelectorAll('.map-wrapper').forEach(function(el) { mapObs.observe(el); });
})();
`;

  // Append before closing });
  js = js.replace(/\}\);[\s]*$/, observer + '\n});');
  fs.writeFileSync(jsPath, js);
  console.log('  Intersection Observer added to main.js.');
}

/* ── 6. Bump CSS version to v=10 ── */
function bumpVersion() {
  console.log('\n[VERSION] Bumping CSS to v=10...');
  const dirs = [ROOT, 'cities', 'brands', 'services'].map(d => path.join(ROOT, d));
  let n = 0;
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
      if (!f.endsWith('.html')) return;
      const fp = path.join(dir, f);
      let h = fs.readFileSync(fp, 'utf8');
      if (h.includes('style.css?v=9')) {
        fs.writeFileSync(fp, h.replace(/style\.css\?v=9/g, 'style.css?v=10'));
        n++;
      }
    });
  });
  console.log(`  Bumped ${n} files to v=10.`);
}

/* ── Run all ── */
(async () => {
  await compressImages();
  fixCityMaps();
  addLazyLoading();
  addMapCSS();
  addMapObserver();
  bumpVersion();
  console.log('\n✓ All performance fixes done. Ready to commit.');
})();
