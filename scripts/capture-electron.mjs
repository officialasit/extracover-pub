// Read the running development app through its existing local Node inspector.
// No packs are installed, removed, or edited by this capture script.
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const targets = await fetch('http://127.0.0.1:5858/json/list').then(r => r.json());
const socket = new WebSocket(targets[0].webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let next = 0;
const pending = new Map();
socket.addEventListener('message', e => {
  const result = JSON.parse(e.data);
  if (pending.has(result.id)) { pending.get(result.id)(result); pending.delete(result.id); }
});
async function evaluate(expression) {
  const id = ++next;
  const response = new Promise(resolve => pending.set(id, resolve));
  socket.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
  const result = await response;
  if (result.result?.exceptionDetails) throw new Error(JSON.stringify(result.result.exceptionDetails));
  return result.result?.result?.value;
}
const output = path.resolve('public/images/extra-cover-live.png');
await mkdir(path.dirname(output), { recursive: true });
const result = await evaluate(`(async () => {
  const { BrowserWindow } = process.mainModule.require('electron');
  const win = BrowserWindow.getAllWindows().find(w => !w.isDestroyed() && !w.webContents.getURL().includes('/coach/'));
  if (!win) throw new Error('No app window');
  win.webContents.closeDevTools();
  win.show();
  await win.webContents.executeJavaScript(${JSON.stringify('[...document.querySelectorAll(\'[role="tab"]\')].find(e => e.textContent.trim() === "Local")?.click(); document.querySelector(".scroll-area").scrollTop = 0;')});
  await new Promise(resolve => setTimeout(resolve, 500));
  await win.webContents.executeJavaScript(${JSON.stringify('document.querySelector(\'[aria-label="Collapse banner"]\')?.click()')});
  await new Promise(resolve => setTimeout(resolve, 1000));
  const previousZoom = win.webContents.getZoomFactor();
  win.webContents.setZoomFactor(0.8);
  await win.webContents.executeJavaScript(${JSON.stringify('document.querySelector(".sp-close-btn")?.click()')});
  await new Promise(resolve => setTimeout(resolve, 650));
  const image = await win.webContents.capturePage();
  process.mainModule.require('fs').writeFileSync(${JSON.stringify(output)}, image.toPNG());
  win.webContents.setZoomFactor(previousZoom);
  return { title: win.getTitle(), size: image.getSize(), banner: await win.webContents.executeJavaScript('document.querySelector(".hero-banner").className') };
})()`);
console.log(JSON.stringify(result, null, 2));
socket.close();
