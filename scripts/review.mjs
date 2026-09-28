import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('review', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const measurements = [];
try {
  for (const [name, width, height, scheme] of [['desktop-dark',1366,768,'dark'],['desktop-light',1366,768,'light'],['mobile-dark',390,844,'dark'],['mobile-light',390,844,'light']]) {
    const context = await browser.newContext({viewport:{width,height},colorScheme:scheme,reducedMotion:'reduce'});
    const page = await context.newPage();
    page.on('pageerror', error=>errors.push(`${name}: ${error.message}`));
    page.on('response', response=>{if(response.status()>=400) errors.push(`${name}: ${response.status()} ${response.url()}`)});
    await page.goto('http://127.0.0.1:4321/', {waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(i=>{i.loading='eager';return i.decode()}));});
    assert.equal(await page.locator('h1').count(),1);
    const dimensions = await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,heroActionBottom:document.querySelector('.hero-actions .button').getBoundingClientRect().bottom,images:[...document.images].filter(i=>i.getAttribute('src')&&(!i.complete||!i.naturalWidth)).map(i=>i.src)}));
    assert.ok(dimensions.scrollWidth<=width,`${name} overflow`);
    assert.equal(dimensions.images.length,0,`${name} broken images`);
    assert.ok(dimensions.heroActionBottom<=height,`${name} hero action below fold`);
    await page.screenshot({path:`review/${name}.png`,fullPage:true});
    await page.screenshot({path:`review/${name}-hero.png`});
    await page.locator('.studio').screenshot({path:`review/${name}-studio.png`});
    for(const tab of await page.locator('[data-feature]').all()) {
      await tab.click();
      assert.equal(await tab.getAttribute('aria-selected'),'true');
      assert.equal(await page.locator('[role="tabpanel"]:visible').count(),1);
      const featureId = await tab.getAttribute('data-feature');
      if(name==='desktop-light') {
        await page.locator('.feature-panels').screenshot({path:`review/feature-${featureId}.png`});
      }
      if(name==='mobile-light' && (featureId==='commentary' || featureId==='music')) {
        await page.locator('.features').screenshot({path:`review/mobile-feature-${featureId}.png`});
      }
    }
    await page.locator('#tab-stadiums').focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#tab-commentary').getAttribute('aria-selected'),'true');
    await page.locator('.faq-list summary').first().click();
    assert.equal(await page.locator('.faq-list details').first().getAttribute('open'),'');
    await page.locator('[data-dialog="download-dialog"]').click();
    assert.equal(await page.locator('#download-dialog').evaluate(d=>d.open),true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#download-dialog').evaluate(d=>d.open),false);
    await page.locator('[data-dialog="studio-dialog"]').first().click();
    await page.locator('#studio-dialog [data-close]').first().click();
    await page.locator('[data-lightbox]').first().click();
    await page.locator('.pswp').waitFor({state:'visible'});
    assert.match(await page.locator('.pswp__caption').innerText(),/Extra Cover/);
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(()=>document.querySelector('.pswp__caption')?.textContent.includes('Pack Studio'));
    await page.screenshot({path:`review/${name}-gallery.png`});
    await page.keyboard.press('Escape');
    await page.locator('.pswp').waitFor({state:'detached'});
    assert.equal(await page.locator('[data-lightbox]').first().evaluate(e=>e===document.activeElement),true);
    if(width<768){await page.locator('.mobile-menu').click();assert.equal(await page.locator('.mobile-menu').getAttribute('aria-expanded'),'true');await page.locator('#main-nav a').first().click();assert.equal(await page.locator('.mobile-menu').getAttribute('aria-expanded'),'false');}
    await page.locator('.theme-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'),scheme==='dark'?'light':'dark');
    measurements.push({name,...dimensions});
    await context.close();
  }
  const motionContext = await browser.newContext({reducedMotion:'no-preference'});
  const motionPage = await motionContext.newPage();
  motionPage.on('pageerror',error=>errors.push(`motion: ${error.message}`));
  const externalRequests = [];
  motionPage.on('request',request=>{if(!request.url().startsWith('http://127.0.0.1:4321/') && !request.url().startsWith('data:')) externalRequests.push(request.url());});
  await motionPage.goto('http://127.0.0.1:4321/',{waitUntil:'networkidle'});
  await motionPage.locator('#tab-commentary').click();
  await motionPage.waitForFunction(()=>getComputedStyle(document.querySelector('[role="tabpanel"]:not([hidden])')).opacity==='1');
  await motionPage.locator('[data-lightbox]').first().click();
  await motionPage.locator('.pswp[data-ready="true"]').waitFor({state:'visible'});
  await motionPage.keyboard.press('Escape');
  await motionPage.locator('.pswp').waitFor({state:'detached'});
  await motionPage.emulateMedia({reducedMotion:'reduce'});
  await motionPage.locator('#tab-stadiums').click();
  assert.equal(await motionPage.locator('[role="tabpanel"]:visible').evaluate(e=>getComputedStyle(e).opacity),'1');
  assert.deepEqual(externalRequests,[], 'No third-party runtime requests');
  await motionContext.close();
  assert.deepEqual(errors,[]);
  await writeFile('review/results.json',JSON.stringify({measurements,errors,checks:'tabs, keyboard navigation, FAQ, dialogs, lightbox, mobile menu, theme, overflow, images, hero CTA'},null,2));
  console.log(JSON.stringify(measurements,null,2));
  console.log('PASS: four viewports/themes and interaction checks.');
} finally { await browser.close(); }
