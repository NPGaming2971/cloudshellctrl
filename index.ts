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

async function loginToGoogle(page: Page, email: string, password: string) {
	const EmailInputSelector = 'input[type="email"]';
	const EmailNextSelector = "#identifierNext";
	const PasswordInputSelector = `input[type="password"]`;
	const PasswordNextSelector = "#passwordNext";

	await page.waitForSelector(EmailInputSelector);
	await page.realClick(EmailInputSelector);
	await page.locator(EmailInputSelector).fill(email);

	await page.waitForSelector(EmailNextSelector);
	await page.realClick(EmailNextSelector);

	await page.waitForSelector(PasswordInputSelector);
	await page.realClick(PasswordInputSelector);
	await page.locator(PasswordInputSelector).fill(password);

	await page.waitForSelector(PasswordNextSelector);
	await page.realClick(PasswordNextSelector);

	await page.waitForNavigation();
}

/**
 * Return true if the terminal is visible, false otherwise.
 */
async function checkTerminalVisibility(page: Page) {
	const TerminalVisibilitySelector = ".bottom-panel.hidden-panel";
	return !Boolean(await page.$(TerminalVisibilitySelector));
}

async function sendCommand(page: Page, command: string) {
	if (!(await checkTerminalVisibility(page))) await toggleTerminalVisibility(page);

	const TerminalSelector = `.terminal-spacer`;
	await page.waitForSelector(TerminalSelector);
	await page.realClick(TerminalSelector);
	await page.type(TerminalSelector, command);

	await page.keyboard.down("Enter");
	return true;
}

async function toggleTerminalVisibility(page: Page) {
	const ToggleTerminalVisibilityButtonSelector = `visibility-toggle[spotlightid=toggle-terminal]`;

	await page.waitForSelector(ToggleTerminalVisibilityButtonSelector, { timeout: 0 });
	await page.realClick(ToggleTerminalVisibilityButtonSelector);
	return true;
}

main();
