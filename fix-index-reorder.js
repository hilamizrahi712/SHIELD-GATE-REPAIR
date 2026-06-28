// Fix index.html: remove map section, reorder sections per spec
const fs = require('fs');
const path = require('path');
const fp = path.join(__dirname, 'index.html');
let html = fs.readFileSync(fp, 'utf8');

// Comment anchors
const ANCHORS = {
  whatWeFix:     '<!-- WHAT WE FIX',
  videos:        '<!-- VIDEO TESTIMONIALS',
  contactForm:   '<!-- CONTACT FORM',
  mapSection:    '<!-- MAP SECTION',
  whyShield:     '<!-- WHY SHIELD',
  stats:         '<!-- STATS',
  galleryPreview:'<!-- GALLERY PREVIEW',
  brands:        '<!-- BRANDS CAROUSEL',
  serviceAreas:  '<!-- SERVICE AREAS',
  faq:           '<!-- FAQ',
  finalCta:      '<!-- FINAL CTA',
  footer:        '<!-- FOOTER',
};

// Validate all anchors exist
for (const [key, anchor] of Object.entries(ANCHORS)) {
  if (!html.includes(anchor)) {
    console.error('MISSING ANCHOR:', key, '->', anchor);
    process.exit(1);
  }
}

// Helper: extract from one anchor to the next
function slice(startKey, endKey) {
  const start = html.indexOf(ANCHORS[startKey]);
  const end = html.indexOf(ANCHORS[endKey]);
  return html.substring(start, end);
}

// Extract pre-content (before What We Fix)
const preContent = html.substring(0, html.indexOf(ANCHORS['whatWeFix']));

// Extract each section
const whatWeFix     = slice('whatWeFix',     'videos');
const videos        = slice('videos',        'contactForm');
const contactForm   = slice('contactForm',   'mapSection');
// mapSection+SMS div → skip entirely (from mapSection to whyShield)
const whyShield     = slice('whyShield',     'stats');
const stats         = slice('stats',         'galleryPreview');
const galleryPreview= slice('galleryPreview','brands');
const brands        = slice('brands',        'serviceAreas');
const serviceAreas  = slice('serviceAreas',  'faq');
const faq           = slice('faq',           'finalCta');
const finalCta      = slice('finalCta',      'footer');
const footerPlus    = html.substring(html.indexOf(ANCHORS['footer']));

// Reassemble: What We Fix → Brands → Videos → Service Areas → Contact → Why Shield → Stats → Gallery → FAQ → Final CTA → Footer
const newHtml = preContent
  + whatWeFix
  + brands
  + videos
  + serviceAreas
  + contactForm
  + whyShield
  + stats
  + galleryPreview
  + faq
  + finalCta
  + footerPlus;

fs.writeFileSync(fp, newHtml, 'utf8');
console.log('index.html reordered. New section order:');
console.log('  1. What We Fix');
console.log('  2. Brands We Service');
console.log('  3. Video Testimonials');
console.log('  4. Service Areas');
console.log('  5. Contact Form');
console.log('  6. Why Shield');
console.log('  7. Stats');
console.log('  8. Gallery Preview');
console.log('  9. FAQ');
console.log('  10. Final CTA');
console.log('  [Map section removed]');
