// Fix: remove "free", Texas→DFW license, Eagle headings, Elite colors, About by-numbers
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;

function getAllHtml(dir) {
  let files = [];
  fs.readdirSync(dir).forEach(f => {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) files = files.concat(getAllHtml(fp));
    else if (f.endsWith('.html')) files.push(fp);
  });
  return files;
}

const allFiles = getAllHtml(ROOT);
let changed = 0;

allFiles.forEach(fp => {
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;

  // ── 1. Remove "FREE" from buttons and headings ──────────────────────────

  // CTA button text replacements
  html = html.replace(/Get a Free Quote/g, 'Request Service');
  html = html.replace(/Free Quote Online/g, 'Request Service');
  html = html.replace(/Get a Free Estimate/g, 'Request Service');
  html = html.replace(/Get Free Quote/gi, 'Request Service');

  // Heading patterns: "Get Your X Gate Diagnosed — Free" → remove the "— Free"
  html = html.replace(/ &#8212; Free(<\/h2>)/g, '$1');
  html = html.replace(/ — Free(<\/h2>)/g, '$1');

  // Specific heading patterns
  html = html.replace(/Get a Free All-O-Matic Repair Estimate/g, 'Schedule All-O-Matic Gate Service');
  html = html.replace(/Get a Free ([A-Za-z\-]+) Repair Estimate/g, 'Schedule $1 Gate Service');
  html = html.replace(/Get a Free ([A-Za-z\-]+) Gate Repair Estimate/g, 'Schedule $1 Gate Service');
  html = html.replace(/Get a Free Repair Estimate/g, 'Request Service');
  html = html.replace(/Get Your ([^<]+) Diagnosed &#8212; Free/g, 'Get Your $1 Diagnosed');
  html = html.replace(/Get Your ([^<]+) Diagnosed — Free/g, 'Get Your $1 Diagnosed');

  // Any remaining "Free Quote" patterns
  html = html.replace(/[Ff]ree [Qq]uote/g, 'Request Service');

  // ── 2. Texas licenses → DFW ─────────────────────────────────────────────
  // Only in the trust bar / short license phrases — not in paragraphs about Texas climate
  html = html.replace(/Licensed &amp; Insured in Texas/g, 'Licensed &amp; Insured — DFW');
  html = html.replace(/Licensed and Insured in Texas/g, 'Licensed and Insured — DFW');
  // JSON-LD schema (index.html)
  html = html.replace(/"Are you licensed and insured in Texas\?"/g, '"Are you licensed and insured in DFW?"');
  html = html.replace(/fully licensed and insured to operate in Texas/g, 'fully licensed and insured to operate in the DFW Metroplex');

  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    changed++;
    console.log('Updated:', path.relative(ROOT, fp));
  }
});

console.log('\nContent fixes applied to', changed, 'files.');

// ── 8. Eagle brand page — remove "access control" from headings ────────────
const eagleFp = path.join(ROOT, 'brands/eagle-gate-repair.html');
let eagleHtml = fs.readFileSync(eagleFp, 'utf8');
const eagleBefore = eagleHtml;

eagleHtml = eagleHtml.replace(/<title>Eagle Access Control Gate Repair DFW/g, '<title>Eagle Gate Repair DFW');
eagleHtml = eagleHtml.replace(/"Eagle Access Control Gate Repair"/g, '"Eagle Gate Repair"');
eagleHtml = eagleHtml.replace(/Eagle Access Control gate operator repair/g, 'Eagle gate operator repair');
eagleHtml = eagleHtml.replace(/Eagle Access Control Gate Repair &#8212;/g, 'Eagle Gate Repair &#8212;');
eagleHtml = eagleHtml.replace(/Eagle Access Control Gate Repair\b/g, 'Eagle Gate Repair');
eagleHtml = eagleHtml.replace(/alt="Eagle Access Control Gate Operator"/g, 'alt="Eagle Gate Operator"');
eagleHtml = eagleHtml.replace(/Eagle Access Control gate operators/g, 'Eagle gate operators');
eagleHtml = eagleHtml.replace(/Eagle Access Control parts/g, 'Eagle parts');
eagleHtml = eagleHtml.replace(/"Expert Eagle Access Control gate operator repair/g, '"Expert Eagle gate operator repair');

if (eagleHtml !== eagleBefore) {
  fs.writeFileSync(eagleFp, eagleHtml, 'utf8');
  console.log('Eagle headings fixed.');
}

// ── 9. About page — remove "By the Numbers" section ───────────────────────
const aboutFp = path.join(ROOT, 'about.html');
let aboutHtml = fs.readFileSync(aboutFp, 'utf8');
const aboutBefore = aboutHtml;

aboutHtml = aboutHtml.replace(
  /<section class="section section-dark">\s*<div class="container">\s*<div class="section-header reveal">\s*<span class="section-tag">By the Numbers<\/span>[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/,
  ''
);

if (aboutHtml !== aboutBefore) {
  fs.writeFileSync(aboutFp, aboutHtml, 'utf8');
  console.log('About "By the Numbers" section removed.');
} else {
  // Try alternative (non-reveal)
  let aboutHtml2 = fs.readFileSync(aboutFp, 'utf8');
  const r = aboutHtml2.replace(
    /<section class="section section-dark">[\s\S]*?By the Numbers[\s\S]*?<\/section>/,
    ''
  );
  if (r !== aboutHtml2) {
    fs.writeFileSync(aboutFp, r, 'utf8');
    console.log('About "By the Numbers" section removed (alt).');
  } else {
    console.log('WARNING: could not find About By the Numbers section');
  }
}

// ── 7. Elite brand page — fix white text in "Inside the Actuator" section ─
const eliteFp = path.join(ROOT, 'brands/elite-gate-repair.html');
let eliteHtml = fs.readFileSync(eliteFp, 'utf8');
const eliteBefore = eliteHtml;

// Add style overrides to the Inside the Actuator why-cards
eliteHtml = eliteHtml.replace(
  /(<span class="section-tag">Inside the Actuator<\/span>[\s\S]*?<div class="why-grid">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/,
  function(match, header, cards, footer) {
    // Replace why-card divs with styled versions
    const styledCards = cards.replace(
      /<div class="why-card">/g,
      '<div class="why-card" style="background:var(--white);border:1px solid var(--border)">'
    );
    return header + styledCards + footer;
  }
);

// Fix h3 and p colors in those specific cards (they inherit white from .why-card CSS)
// Add color overrides via a wrapping div
eliteHtml = eliteHtml.replace(
  /(<span class="section-tag">Inside the Actuator<\/span>)/,
  '$1\n    <style>.actuator-section .why-card{background:var(--white);border:1px solid var(--border)}.actuator-section .why-card h3{color:var(--navy)}.actuator-section .why-card p{color:var(--text-body)}</style>'
);

// Wrap the section with the class
eliteHtml = eliteHtml.replace(
  /(<section class="section section-alt">\s*<div class="container">\s*<div class="section-header">\s*<span class="section-tag">Inside the Actuator)/,
  '<section class="section section-alt actuator-section">\n  <div class="container">\n    <div class="section-header">\n    <span class="section-tag">Inside the Actuator'
);

if (eliteHtml !== eliteBefore) {
  fs.writeFileSync(eliteFp, eliteHtml, 'utf8');
  console.log('Elite "Inside the Actuator" text colors fixed.');
} else {
  console.log('WARNING: Elite actuator section - no match, trying simpler approach');
  // Simpler: just inline the style in the section
  let eliteHtml3 = fs.readFileSync(eliteFp, 'utf8');
  const r = eliteHtml3.replace(
    '<span class="section-tag">Inside the Actuator</span>',
    '<span class="section-tag">Inside the Actuator</span>\n    <style>.actuator-section .why-card{background:var(--white);border:1px solid var(--border)}.actuator-section .why-card h3{color:var(--navy)!important}.actuator-section .why-card p{color:var(--text-body)!important}</style>'
  );
  if (r !== eliteHtml3) {
    let r2 = r.replace(
      /<section class="section section-alt">\s*<div class="container">\s*<div class="section-header">\s*<span class="section-tag">Inside the Actuator/,
      '<section class="section section-alt actuator-section"><div class="container"><div class="section-header"><span class="section-tag">Inside the Actuator'
    );
    fs.writeFileSync(eliteFp, r2, 'utf8');
    console.log('Elite colors fixed (simpler approach).');
  }
}

console.log('\nAll content fixes done.');
