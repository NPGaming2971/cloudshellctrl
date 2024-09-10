import { connect, type PageWithCursor as Page } from "puppeteer-real-browser";
import PuppeteerStealthPlugin from "puppeteer-extra-plugin-stealth";
import { getIsolatedBrowserPath } from "./utils.js";
import { ChromeFlags, UserAgent } from "./constants.js";

async function main() {
	const browserPath = await getIsolatedBrowserPath();
	const { page } = await connect({
		headless: false,
		args: ChromeFlags,
		turnstile: false,
		customConfig: {
			chromePath: browserPath,
		},
		connectOption: {
			acceptInsecureCerts: true,
		},
		plugins: [PuppeteerStealthPlugin()],
	});

	await page.setUserAgent(UserAgent);
	await page.goto("https://shell.cloud.google.com", { waitUntil: "domcontentloaded" });
}

main();

export async function loginToGoogle(page: Page, email: string, password: string) {
	const EmailInputSelector = 'input[type="email"]';
	const EmailNextSelector = "#identifierNext";
	const PasswordInputSelector = `input[type="password"]`;
	const PasswordNextSelector = "#passwordNext";

	await page.waitForSelector(EmailInputSelector);
	await page.type(EmailInputSelector, email);

	await page.waitForSelector(EmailNextSelector);
	await page.click(EmailNextSelector);

	await page.waitForSelector(PasswordInputSelector);
	await page.realClick(PasswordInputSelector);
	await page.type(PasswordInputSelector, password);

	await page.waitForSelector(PasswordNextSelector);
	await page.realClick(PasswordNextSelector);

	await page.waitForNavigation();
}

/**
 * Return true if the terminal is visible, false otherwise.
 */
export async function checkTerminalVisibility(page: Page) {
	const TerminalVisibilitySelector = ".bottom-panel.hidden-panel";
	return !Boolean(await page.$(TerminalVisibilitySelector));
}

/**
 * Send a command to the terminal.
 */
export async function sendCommand(page: Page, command: string) {
	if (!(await checkTerminalVisibility(page))) await toggleTerminalVisibility(page);

	const TerminalSelector = `.terminal-spacer`;
	await page.waitForSelector(TerminalSelector);
	await page.realClick(TerminalSelector);
	await page.keyboard.type(command);

	await page.evaluate(() => {
		const target = document.querySelector(".xterm-rows")!;
		const fn = () => {
			console.log("disconnected");
			observer.disconnect();
		};
		let timeout = window.setTimeout(fn, 3000);
		const observer = new MutationObserver((mutations) => {
			console.log("mutation");
			for (const mutation of mutations) {
				console.log([...mutation.addedNodes.values()].map((i) => i.textContent).join(""));
			}
			clearTimeout(timeout);
			timeout = window.setTimeout(fn, 3000);
		});

		observer.observe(target, { childList: true, subtree: true });
		return true;
	});

	await page.keyboard.down("Enter");
	return true;
}

/**
 * Toggle terminal visibility. Some functions need the terminal to be visible to work.
 * @param page
 * @returns
 */
export async function toggleTerminalVisibility(page: Page) {
	const ToggleTerminalVisibilityButtonSelector = `visibility-toggle[spotlightid=toggle-terminal]`;

	await page.waitForSelector(ToggleTerminalVisibilityButtonSelector, { timeout: 0 });
	await page.realClick(ToggleTerminalVisibilityButtonSelector);
	return true;
}

/**
 * Toggle terminal visibility. Some functions need the terminal to be visible to work.
 * @param page
 * @returns
 */
export async function toggleEditorVisibility(page: Page) {
	const ToggleEditorVisibilityButtonSelector = `visibility-toggle[spotlightid=toggle-editor]`;

	await page.waitForSelector(ToggleEditorVisibilityButtonSelector, { timeout: 0 });
	await page.realClick(ToggleEditorVisibilityButtonSelector);
	return true;
}
