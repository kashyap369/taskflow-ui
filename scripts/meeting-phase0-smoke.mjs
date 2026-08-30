import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const chromeCandidates = [
  process.env['CHROME_PATH'],
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);
const chromePath = chromeCandidates.find((candidate) => existsSync(candidate));

if (!chromePath) {
  throw new Error('Chrome or Edge is required for the Meeting Phase 0 smoke test.');
}

const profilePath = mkdtempSync(join(tmpdir(), 'taskflow-meeting-phase0-'));
const port = 9333;
const probeUrl =
  'http://localhost:4200/dev/meetings-livekit?api=http://localhost:5138/api';

const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--use-fake-device-for-media-stream',
    '--use-fake-ui-for-media-stream',
    '--auto-select-desktop-capture-source=Entire screen',
    '--allow-http-screen-capture',
    '--unsafely-treat-insecure-origin-as-secure=http://localhost:4200,http://localhost:5138',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profilePath}`,
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true },
);

async function run() {
  let browser;
  const sessions = [];

  try {
  const version = await retry(async () => {
    const response = await fetch(`http://127.0.0.1:${port}/json/version`);
    if (!response.ok) throw new Error('Chrome DevTools endpoint is not ready.');
    return response.json();
  });
  browser = new CdpSession(version.webSocketDebuggerUrl);
  await browser.ready;

  const first = await createProbeContext(browser);
  const second = await createProbeContext(browser);
  sessions.push(first.session, second.session);

  await Promise.all([waitForProbe(first.session), waitForProbe(second.session)]);
  await joinProbe(first.session, 'Phase 0 browser one');
  await joinProbe(second.session, 'Phase 0 browser two');
  await Promise.all([
    waitForText(first.session, '.status', '2 participant(s)'),
    waitForText(second.session, '.status', '2 participant(s)'),
  ]);

  await Promise.all([
    enableMedia(first.session, 'Enable microphone', 'Mute microphone'),
    enableMedia(first.session, 'Enable camera', 'Stop camera'),
    enableMedia(second.session, 'Enable microphone', 'Mute microphone'),
    enableMedia(second.session, 'Enable camera', 'Stop camera'),
  ]);
  await waitForElementCount(first.session, '.media-grid video', 2);
  await waitForElementCount(second.session, '.media-grid video', 2);
  await waitForElementCount(first.session, '.media-grid audio', 1);
  await waitForElementCount(second.session, '.media-grid audio', 1);

  await clickButton(first.session, 'Share screen');
  await waitForButton(first.session, 'Stop sharing');
  await waitForElementCount(second.session, '.media-grid video', 3);
  await clickButton(first.session, 'Stop sharing');
  await waitForButton(first.session, 'Share screen');

  await clickButton(second.session, 'Disconnect');
  await waitForText(first.session, '.status', '1 participant(s)');
  await waitForButton(second.session, 'Join probe room');
  await joinProbe(second.session, 'Phase 0 browser two reconnected');
  await Promise.all([
    waitForText(first.session, '.status', '2 participant(s)'),
    waitForText(second.session, '.status', '2 participant(s)'),
  ]);

  console.log(
    JSON.stringify(
      {
        liveKit: 'connected',
        browserContexts: 2,
        participants: 2,
        microphone: 'published and subscribed',
        camera: 'published and subscribed',
        screenShare: 'published, subscribed, and stopped',
        reconnect: 'new API-issued token joined successfully',
      },
      null,
      2,
    ),
  );
  } finally {
    for (const session of sessions) session.close();
    browser?.close();
    if (chrome.exitCode === null) {
      const exited = new Promise((resolve) => chrome.once('exit', resolve));
      chrome.kill();
      await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 2_000))]);
    }
    if (profilePath.startsWith(tmpdir())) {
      try {
        rmSync(profilePath, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
      } catch (error) {
        console.warn(`Temporary Chrome profile cleanup deferred: ${error.message}`);
      }
    }
  }
}

async function createProbeContext(browserSession) {
  const { browserContextId } = await browserSession.send('Target.createBrowserContext');
  const { targetId } = await browserSession.send('Target.createTarget', {
    url: probeUrl,
    browserContextId,
  });
  const target = await retry(async () => {
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const match = targets.find((candidate) => candidate.id === targetId);
    if (!match?.webSocketDebuggerUrl) throw new Error('Probe target is not ready.');
    return match;
  });
  const session = new CdpSession(target.webSocketDebuggerUrl);
  await session.ready;
  await session.send('Runtime.enable');
  await session.send('Page.enable');
  return { browserContextId, targetId, session };
}

async function waitForProbe(session) {
  await retry(async () => {
    const ready = await evaluate(
      session,
      `document.readyState !== 'loading' &&
       document.querySelector('button')?.textContent?.includes('Join probe room')`,
    );
    if (!ready) throw new Error('Probe page did not render.');
  }, 20000);
  await new Promise((resolve) => setTimeout(resolve, 500));
}

async function joinProbe(session, displayName) {
  await evaluate(session, `(() => {
    const input = document.querySelector('input');
    input.value = ${JSON.stringify(displayName)};
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await clickButton(session, 'Join probe room');
  try {
    await waitForText(session, '.status', 'connected', 5000);
  } catch {
    await clickButton(session, 'Join probe room');
    await waitForText(session, '.status', 'connected');
  }
}

async function enableMedia(session, enableLabel, enabledLabel) {
  await clickButton(session, enableLabel);
  await waitForButton(session, enabledLabel, 20000);
}

async function clickButton(session, label) {
  await evaluate(
    session,
    `(() => {
      const button = [...document.querySelectorAll('button')].find(
        (candidate) => candidate.textContent.trim() === ${JSON.stringify(label)}
      );
      if (!button) throw new Error('Button not found: ${label}');
      button.click();
    })()`,
  );
}

async function waitForButton(session, label, timeout = 10000) {
  await waitForExpression(
    session,
    `[...document.querySelectorAll('button')].some(
      (button) => button.textContent.trim() === ${JSON.stringify(label)}
    )`,
    timeout,
    `Button did not reach state: ${label}`,
  );
}

async function waitForText(session, selector, text, timeout = 10000) {
  await waitForExpression(
    session,
    `document.querySelector(${JSON.stringify(selector)})?.textContent?.includes(${JSON.stringify(text)})`,
    timeout,
    `${selector} did not include ${text}`,
  );
}

async function waitForElementCount(session, selector, minimum, timeout = 15000) {
  await waitForExpression(
    session,
    `document.querySelectorAll(${JSON.stringify(selector)}).length >= ${minimum}`,
    timeout,
    `${selector} did not reach ${minimum} elements`,
  );
}

async function waitForExpression(session, expression, timeout, message) {
  await evaluate(session, `new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error(${JSON.stringify(message)})), ${timeout});
    const poll = () => {
      if (${expression}) { clearTimeout(timeoutId); resolve(true); return; }
      setTimeout(poll, 100);
    };
    poll();
  })`);
}

async function evaluate(session, expression) {
  const result = await session.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  }
  return result.result.value;
}

async function retry(action, timeout = 10000) {
  const deadline = Date.now() + timeout;
  let lastError;
  while (Date.now() < deadline) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw lastError;
}

class CdpSession {
  #id = 0;
  #pending = new Map();

  constructor(url) {
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const pending = this.#pending.get(message.id);
      if (!pending) return;
      this.#pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = ++this.#id;
    const result = new Promise((resolve, reject) => this.#pending.set(id, { resolve, reject }));
    this.socket.send(JSON.stringify({ id, method, params }));
    return result;
  }

  close() {
    this.socket.close();
  }
}

await run();
