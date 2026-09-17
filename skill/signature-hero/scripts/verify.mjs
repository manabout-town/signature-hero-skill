// verify.mjs — signature-hero 검사: 폭별 인트로 컷 → 인트로가 스스로 열리는지 → 히어로 컷, 가로 넘침·콘솔 에러
// 사용: node verify.mjs <url> <출력폴더> [인트로선택자=#kf-intro] [열림클래스=kf-open]
// playwright 필요. 조작 없이도 끝나야 하므로 "아무것도 안 했을 때 8초 안에 열림"을 검사한다.
import { chromium } from 'playwright';
const [,, url, out = '.', introSel = '#kf-intro', openCls = 'kf-open'] = process.argv;
if (!url) { console.error('usage: node verify.mjs <url> <outdir> [introSelector] [openClass]'); process.exit(1); }
const b = await chromium.launch();
const log = [];
for (const [w, h, touch] of [[1440, 820, false], [390, 844, true], [320, 700, true]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: touch });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url);
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}/intro-${w}.png` });
  const opened = await p.waitForFunction(c => document.documentElement.classList.contains(c), openCls, { timeout: 8000 }).then(() => true, () => false);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${out}/hero-${w}.png` });
  const r = await p.evaluate(sel => {
    const el = document.querySelector(sel);
    return { hscroll: document.documentElement.scrollWidth - innerWidth, introHidden: !el || getComputedStyle(el).visibility === 'hidden' || getComputedStyle(el).opacity === '0' };
  }, introSel);
  const ok = opened && r.introHidden && r.hscroll === 0 && !errs.length;
  log.push(`${w} ${ok ? 'OK' : 'CHECK'} opened=${opened} ${JSON.stringify(r)}${errs.length ? ' errors=' + JSON.stringify(errs) : ''}`);
  await p.close();
}
// reduced-motion: 인트로가 바로 생략되는지
const rm = await b.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
await rm.goto(url); await rm.waitForTimeout(600);
log.push(`reduced-motion opened=${await rm.evaluate(c => document.documentElement.classList.contains(c), openCls)}`);
console.log(log.join('\n'));
await b.close();
