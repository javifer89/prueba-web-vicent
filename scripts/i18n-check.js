#!/usr/bin/env node
/**
 * i18n Validation Script
 *
 * Validates:
 * 1. UI translation keys consistency across ca/es/en
 * 2. Editorial content translation status
 * 3. Missing/outdated translations
 *
 * Usage: npm run i18n:check
 */

const fs = require('fs');
const path = require('path');

const LOCALE_DIR = path.join(__dirname, '../src/locale');
const CONTENT_DIR = path.join(__dirname, '../src/assets/content');

const LOCALES = ['ca', 'es', 'en'];
const SOURCE_LOCALE = 'ca';

function loadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Error loading ${filePath}:`, e.message);
    return null;
  }
}

function flattenKeys(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      result[newKey] = value;
    } else if (value && typeof value === 'object') {
      Object.assign(result, flattenKeys(value, newKey));
    }
  }
  return result;
}

function checkUiTranslations() {
  console.log('\n========== UI TRANSLATIONS (src/locale/*.json) ==========\n');

  const localeFiles = {};
  let hasErrors = false;

  for (const locale of LOCALES) {
    const filePath = path.join(LOCALE_DIR, `${locale}.json`);
    const content = loadJson(filePath);
    if (!content) {
      console.error(`✗ ${locale}: Failed to load`);
      hasErrors = true;
      continue;
    }
    localeFiles[locale] = flattenKeys(content);
    console.log(`✓ ${locale}: ${Object.keys(localeFiles[locale]).length} keys`);
  }

  // Check consistency against source locale (ca)
  const sourceKeys = new Set(Object.keys(localeFiles[SOURCE_LOCALE] || {}));

  for (const locale of LOCALES) {
    if (locale === SOURCE_LOCALE) continue;

    const targetKeys = new Set(Object.keys(localeFiles[locale] || {}));

    // Missing keys
    const missing = [...sourceKeys].filter(k => !targetKeys.has(k));
    if (missing.length > 0) {
      console.log(`\n✗ ${locale.toUpperCase()}: ${missing.length} MISSING keys:`);
      for (const key of missing) {
        console.log(`  - ${key}`);
      }
      hasErrors = true;
    } else {
      console.log(`✓ ${locale.toUpperCase()}: No missing keys`);
    }

    // Extra keys (in target but not in source)
    const extra = [...targetKeys].filter(k => !sourceKeys.has(k));
    if (extra.length > 0) {
      console.log(`\n⚠ ${locale.toUpperCase()}: ${extra.length} EXTRA keys (not in ${SOURCE_LOCALE}):`);
      for (const key of extra.slice(0, 20)) {
        console.log(`  - ${key}`);
      }
      if (extra.length > 20) console.log(`  ... and ${extra.length - 20} more`);
    }
  }

  return hasErrors;
}

function checkEditorialContent() {
  console.log('\n========== EDITORIAL CONTENT (src/assets/content/) ==========\n');

  if (!fs.existsSync(CONTENT_DIR)) {
    console.log('⚠ Content directory not found');
    return false;
  }

  const contentTypes = fs.readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let hasErrors = false;

  for (const type of contentTypes) {
    const typeDir = path.join(CONTENT_DIR, type);
    const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.json'));

    console.log(`\n--- ${type.toUpperCase()} (${files.length} files) ---`);

    for (const file of files) {
      const filePath = path.join(typeDir, file);
      const content = loadJson(filePath);

      if (!content) {
        console.log(`  ✗ ${file}: Failed to load`);
        hasErrors = true;
        continue;
      }

      if (!content.metadata) {
        console.log(`  ✗ ${file}: Missing metadata`);
        hasErrors = true;
        continue;
      }

      const { id, type: metaType, translations, status, updatedAt, sourceLocale } = content.metadata;

      // Check structure
      if (!translations || !status || !updatedAt) {
        console.log(`  ✗ ${file}: Incomplete metadata`);
        hasErrors = true;
        continue;
      }

      // Check translations exist for all locales
      const missingLocales = LOCALES.filter(l => !translations[l]);
      if (missingLocales.length > 0) {
        console.log(`  ✗ ${file}: Missing translations for: ${missingLocales.join(', ')}`);
        hasErrors = true;
      }

      // Check status
      const outdatedLocales = LOCALES.filter(l => status[l] === 'outdated' || status[l] === 'pending' || status[l] === 'missing');
      if (outdatedLocales.length > 0) {
        console.log(`  ⚠ ${file}: Outdated/pending translations: ${outdatedLocales.join(', ')}`);
      }

      // Check source locale is 'ca'
      if (sourceLocale !== 'ca') {
        console.log(`  ⚠ ${file}: Source locale is '${sourceLocale}', expected 'ca'`);
      }

      // Check data exists for all locales
      if (content.data) {
        const missingDataLocales = LOCALES.filter(l => !content.data[l]);
        if (missingDataLocales.length > 0) {
          console.log(`  ✗ ${file}: Missing data for: ${missingDataLocales.join(', ')}`);
          hasErrors = true;
        } else {
          console.log(`  ✓ ${file}: OK (${LOCALES.join('/')}) [source: ${sourceLocale}]`);
          if (outdatedLocales.length > 0) {
            console.log(`    Status: ${JSON.stringify(status)}`);
          }
        }
      }
    }
  }

  return hasErrors;
}

function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║            i18n VALIDATION - Vicent Sellés Álamo            ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`Source locale: ${SOURCE_LOCALE}`);
  console.log(`Target locales: ${LOCALES.join(', ')}`);

  let hasErrors = false;

  hasErrors = checkUiTranslations() || hasErrors;
  hasErrors = checkEditorialContent() || hasErrors;

  console.log('\n========== SUMMARY ==========\n');

  if (hasErrors) {
    console.log('✗ VALIDATION FAILED - Issues found above');
    process.exit(1);
  } else {
    console.log('✓ ALL CHECKS PASSED');
    console.log('✓ UI translations: OK');
    console.log('✓ Editorial content: OK');
    process.exit(0);
  }
}

main();
