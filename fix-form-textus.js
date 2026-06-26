/**
 * Task 5: Add lead form to all city pages (after hero, before city-intro)
 * Task 6: Add Text Us button to index.html (after map), service pages, city forms
 */
const fs   = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname);

function readF(p)  { return fs.readFileSync(p, 'utf8'); }
function writeF(p, c) { fs.writeFileSync(p, c, 'utf8'); console.log('  wrote:', p.replace(ROOT, '')); }

function toTitleCase(slug) {
  const specials = {
    'desoto': 'DeSoto', 'north-richland-hills': 'North Richland Hills',
    'mckinney': 'McKinney', 'fort-worth': 'Fort Worth',
    'flower-mound': 'Flower Mound', 'grand-prairie': 'Grand Prairie',
    'cedar-hill': 'Cedar Hill', 'farmers-branch': 'Farmers Branch'
  };
  if (specials[slug]) return specials[slug];
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/* ────────────────────────────────────────────────
   TASK 5: Lead form on every city page
──────────────────────────────────────────────── */
console.log('\n[TASK 5] Adding lead forms to city pages...');

const citiesDir = path.join(ROOT, 'cities');
let formCount = 0;

fs.readdirSync(citiesDir).forEach(file => {
  if (!file.endsWith('.html')) return;
  const citySlug = file.replace('-gate-repair.html', '');
  const cityName = toTitleCase(citySlug);
  const fp = path.join(citiesDir, file);
  let html = readF(fp);

  // Skip if form already added
  if (html.includes('cta-form-section') && html.includes('Get Fast Gate Repair')) {
    console.log(`  skip ${file} (form already present)`);
    return;
  }

  const cityForm = `
<section class="section cta-form-section">
  <div class="container">
    <div class="cta-form-inner reveal">
      <div class="cta-form-header">
        <span class="section-tag">Schedule Service</span>
        <h2>Get Fast Gate Repair in ${cityName}</h2>
        <p>Tell us what&#8217;s wrong and we&#8217;ll call you back within 30 minutes. Or call us directly at <a href="tel:+12147354314" class="phone-link">+1 (214) 735-4314</a>.</p>
      </div>
      <form class="formspree-form cta-form" action="https://formspree.io/f/xykqkqzr" method="POST">
        <div class="cta-form-row">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" name="name" placeholder="John Smith" required>
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" placeholder="+1 (214) 000-0000" required>
          </div>
        </div>
        <div class="form-group">
          <label>Address</label>
          <input type="text" name="address" placeholder="Your street address in ${cityName}">
        </div>
        <div class="form-group">
          <label>Message (optional)</label>
          <textarea name="message" rows="3" placeholder="Describe the problem with your gate&#8230;"></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-lg" style="width:100%;justify-content:center;background:var(--gold);color:var(--navy)">Schedule Service &#8594;</button>
        <p style="text-align:center;margin-top:16px;color:rgba(255,255,255,.55);font-size:.85rem">Prefer to text? <a href="sms:+12147354314" class="btn-text-us" style="font-size:.8rem;padding:6px 14px;margin-top:0;display:inline-flex">&#128172; Text Us</a></p>
      </form>
    </div>
  </div>
</section>
`;

  // Insert after closing </div> of page-hero, before first <section class="section">
  // Pattern: the page-hero closing </div> followed by blank line then <section class="section">
  const heroClose = '</div>\n\n<section class="section">';
  const heroCloseAlt = '</div>\n<section class="section">';

  if (html.includes(heroClose)) {
    html = html.replace(heroClose, `</div>\n${cityForm}\n<section class="section">`);
    writeF(fp, html);
    formCount++;
  } else if (html.includes(heroCloseAlt)) {
    html = html.replace(heroCloseAlt, `</div>\n${cityForm}\n<section class="section">`);
    writeF(fp, html);
    formCount++;
  } else {
    // Fallback: insert before first <section class="section">
    const idx = html.indexOf('<section class="section">');
    if (idx !== -1) {
      html = html.slice(0, idx) + cityForm + '\n' + html.slice(idx);
      writeF(fp, html);
      formCount++;
    } else {
      console.log(`  WARN: could not find insertion point in ${file}`);
    }
  }
});

console.log(`  Added forms to ${formCount} city pages.`);

/* ────────────────────────────────────────────────
   TASK 6: Text Us button — index.html after map
──────────────────────────────────────────────── */
console.log('\n[TASK 6] Adding Text Us to index.html after map...');
const indexPath = path.join(ROOT, 'index.html');
let idx = readF(indexPath);

const TEXT_US_STANDALONE = `
<div class="text-center" style="padding:18px 0 22px;background:var(--off-white)">
  <a href="sms:+12147354314" class="btn-text-us">&#128172; Prefer to text? Message us at (214) 735-4314</a>
</div>
`;

// Insert after the map section closes and before Why Shield
const MAP_CLOSE = '</section>\n\n<!-- WHY SHIELD';
const MAP_CLOSE_ALT = '</section>\n<!-- WHY SHIELD';

if (!idx.includes('Prefer to text?')) {
  if (idx.includes(MAP_CLOSE)) {
    idx = idx.replace(MAP_CLOSE, `</section>\n${TEXT_US_STANDALONE}\n<!-- WHY SHIELD`);
  } else if (idx.includes(MAP_CLOSE_ALT)) {
    idx = idx.replace(MAP_CLOSE_ALT, `</section>\n${TEXT_US_STANDALONE}\n<!-- WHY SHIELD`);
  } else {
    // Add after the map section with a more generic search
    idx = idx.replace(
      /(<\/section>)\s*\n(<!-- WHY SHIELD)/,
      `$1\n${TEXT_US_STANDALONE}\n$2`
    );
  }
  writeF(indexPath, idx);
  console.log('  Added Text Us after map on index.html');
} else {
  console.log('  index.html already has Text Us');
}

/* ────────────────────────────────────────────────
   TASK 6: Text Us on service pages (in long sections without nearby CTAs)
   Insert a standalone Text Us block after the first <section class="section section-alt">
   that doesn't already have a CTA button
──────────────────────────────────────────────── */
console.log('\n[TASK 6] Adding Text Us to service pages...');

const servicesDir = path.join(ROOT, 'services');
const SERVICE_TEXT_US = `
<div class="text-center" style="padding:10px 0 24px">
  <a href="sms:+12147354314" class="btn-text-us">&#128172; Text Us — (214) 735-4314</a>
</div>
`;

fs.readdirSync(servicesDir).forEach(file => {
  if (!file.endsWith('.html')) return;
  const fp = path.join(servicesDir, file);
  let h = readF(fp);
  if (h.includes('btn-text-us') && !h.includes('Text Us — (214)')) {
    // has old footer one, add another in a prominent position
  }
  if (h.includes('Text Us — (214)')) { console.log(`  skip ${file} (already has text us)`); return; }
  // Add after the first FAQ section or long section without a CTA button
  // Target: right before </section> that follows a <div class="faq-list">
  const faqClose = '</div>\n  </div>\n</section>\n\n\n<!-- CONTACT FORM';
  const faqCloseAlt = '</div>\n  </div>\n</section>\n\n<!-- CONTACT FORM';
  if (h.includes(faqClose)) {
    h = h.replace(faqClose, `</div>\n  </div>\n</section>\n${SERVICE_TEXT_US}\n<!-- CONTACT FORM`);
    writeF(fp, h);
  } else if (h.includes(faqCloseAlt)) {
    h = h.replace(faqCloseAlt, `</div>\n  </div>\n</section>\n${SERVICE_TEXT_US}\n<!-- CONTACT FORM`);
    writeF(fp, h);
  } else {
    // Generic: insert before the CTA section
    const ctaIdx = h.indexOf('<section class="cta-section">');
    if (ctaIdx !== -1 && !h.includes('Text Us — (214)')) {
      h = h.slice(0, ctaIdx) + SERVICE_TEXT_US + '\n' + h.slice(ctaIdx);
      writeF(fp, h);
    }
  }
});

/* ────────────────────────────────────────────────
   TASK 6: Text Us on contact.html — add near form header
──────────────────────────────────────────────── */
console.log('\n[TASK 6] Checking contact.html for Text Us...');
const contactPath = path.join(ROOT, 'contact.html');
let contact = readF(contactPath);

if (!contact.includes('Text Us — (214)') && !contact.includes('sms:+12147354314')) {
  // Add in the emergency banner or near phone number in contact info
  // Find the hero section phone link and add Text Us nearby
  contact = contact.replace(
    '<p>&#128680; 24/7 Emergency</p>',
    '<p>&#128680; 24/7 Emergency</p>\n        <p><a href="sms:+12147354314" class="btn-text-us" style="margin-top:8px">&#128172; Text Us</a></p>'
  );
  writeF(contactPath, contact);
  console.log('  Added Text Us to contact.html');
} else {
  console.log('  contact.html already has Text Us');
}

console.log('\n✓ All done. Commit and deploy next.');
