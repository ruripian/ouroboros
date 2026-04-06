#!/usr/bin/env node
/**
 * 번역 키 검증 스크립트
 *
 * 사용법:
 *   node scripts/check-translations.js
 *
 * 기준 언어(ko)와 나머지 언어 파일을 비교하여
 * 누락된 키 / 불필요한 키를 출력한다.
 *
 * CI에서 사용할 경우: 누락 키가 있으면 exit code 1 반환.
 */

const fs = require("fs");
const path = require("path");

const LOCALES_DIR = path.join(__dirname, "../src/locales");
const BASE_LANG = "ko"; // 기준 언어

/** 중첩 객체를 점(.) 구분 평탄 키 배열로 변환 */
function flattenKeys(obj, prefix = "") {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return flattenKeys(value, fullKey);
    }
    return [fullKey];
  });
}

const allLangs = fs.readdirSync(LOCALES_DIR).filter((f) =>
  fs.statSync(path.join(LOCALES_DIR, f)).isDirectory()
);

const namespaces = fs
  .readdirSync(path.join(LOCALES_DIR, BASE_LANG))
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""));

let hasErrors = false;

console.log(`\n기준 언어: ${BASE_LANG} | 네임스페이스: ${namespaces.join(", ")}\n`);

for (const ns of namespaces) {
  const basePath = path.join(LOCALES_DIR, BASE_LANG, `${ns}.json`);
  const baseData = JSON.parse(fs.readFileSync(basePath, "utf-8"));
  const baseKeys = new Set(flattenKeys(baseData));

  for (const lang of allLangs) {
    if (lang === BASE_LANG) continue;

    const filePath = path.join(LOCALES_DIR, lang, `${ns}.json`);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ [${lang}/${ns}] 파일 없음`);
      hasErrors = true;
      continue;
    }

    const langData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const langKeys = new Set(flattenKeys(langData));

    const missing = [...baseKeys].filter((k) => !langKeys.has(k));
    const extra = [...langKeys].filter((k) => !baseKeys.has(k));

    if (missing.length === 0 && extra.length === 0) {
      console.log(`✅ [${lang}/${ns}] 모든 키 일치`);
    } else {
      if (missing.length > 0) {
        console.error(`❌ [${lang}/${ns}] 누락된 키 ${missing.length}개:`);
        missing.forEach((k) => console.error(`     - ${k}`));
        hasErrors = true;
      }
      if (extra.length > 0) {
        console.warn(`⚠️  [${lang}/${ns}] 불필요한 키 ${extra.length}개 (${BASE_LANG}에 없음):`);
        extra.forEach((k) => console.warn(`     + ${k}`));
      }
    }
  }
}

console.log();
process.exit(hasErrors ? 1 : 0);
