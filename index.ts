import { connect, type PageWithCursor as Page } from "puppeteer-real-browser";
import PuppeteerStealthPlugin from "puppeteer-extra-plugin-stealth";
import { getIsolatedBrowserPath } from "./utils.js";
import { ChromeFlags, UserAgent } from "./constants.js";
import { type SendCommandOptions } from "./typings.js";
import type { Cookie } from "puppeteer-core-patch";

type InitOptions = {
	cookies?: Cookie[];
};
export async function init(options: InitOptions = {}) {
	const browserPath = await getIsolatedBrowserPath();
	const result = await connect({
		headless: true,
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
	const { page } = result;
	const { cookies } = options;

	await page.setRequestInterception(true);
	page.on("request", (request) => {
		if (["image", "stylesheet", "font", "other", "media"].indexOf(request.resourceType()) !== -1) {
			request.abort();
		} else request.continue();
	});

	await page.setUserAgent(UserAgent);
	if (cookies) await page.setCookie(...cookies);

	await page.goto("https://shell.cloud.google.com", { waitUntil: "domcontentloaded" });
	if (cookies) {
		await closeAuthDialog(page);
	}

	return result;
}

async function closeAuthDialog(page: Page) {
	const AuthDialogCloseButtonSelector = `xpath///span[normalize-space() = 'Close']`;

	await page.waitForSelector(AuthDialogCloseButtonSelector);
	await page.click(AuthDialogCloseButtonSelector);
}

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

export async function reconnectShell(page: Page, options: SendCommandOptions = {}) {
	const TerminalSelector = `.terminal-spacer`;
	const ReconnectButtonSelector = `xpath///span[normalize-space()='Reconnect']`;

	if (!(await checkTerminalVisibility(page))) await toggleTerminalVisibility(page);
	const { terminalIndex } = options;
	if (terminalIndex) {
		await focusOnTerminalIndex(page, terminalIndex);
	}

	const button = await page.$(ReconnectButtonSelector);

	if (!button) return;
	await button.click();
	await page.waitForSelector(TerminalSelector);
}

/**
 * Send a command to the terminal.
 */
export async function sendCommand(page: Page, command: string, options: SendCommandOptions = {}) {
	const { terminalIndex } = options;

	if (!(await checkTerminalVisibility(page))) await toggleTerminalVisibility(page);
	if (terminalIndex) {
		await focusOnTerminalIndex(page, terminalIndex);
	}
	await reconnectShell(page);

	const TerminalSelector = `.terminal-spacer`;
	await page.waitForSelector(TerminalSelector);
	await page.click(TerminalSelector);

	await page.keyboard.type(command);
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
 * Toggle editor visibility. Some functions need the editor to be visible to work.
 * @param page
 * @returns
 */
export async function toggleEditorVisibility(page: Page) {
	const ToggleEditorVisibilityButtonSelector = `visibility-toggle[spotlightid=toggle-editor]`;

	await page.waitForSelector(ToggleEditorVisibilityButtonSelector, { timeout: 0 });
	await page.realClick(ToggleEditorVisibilityButtonSelector);
	return true;
}

export async function newTerminal(page: Page, skipTerminalNumberCheck: boolean = false) {
	if (!(await checkTerminalVisibility(page))) await toggleTerminalVisibility(page);

	if (!skipTerminalNumberCheck) {
		const TerminalTabSelector = `div[role=tab]`;
		const result = await page.$$(TerminalTabSelector);
		if (result.length >= 4) throw new RangeError("Can not create more than 4 terminal");
	}

	const CreateNewTerminalSelector = `button[spotlightid=cloud-shell-add-tab-button]`;

	await page.waitForSelector(CreateNewTerminalSelector);
	await page.click(CreateNewTerminalSelector);
}

export async function focusOnTerminalIndex(page: Page, index: number) {
	if (!(await checkTerminalVisibility(page))) await toggleTerminalVisibility(page);

	const TerminalTabIndexSelector = `xpath///div[@role='tab' and @aria-posinset=${index}]`;
	await page.waitForSelector(TerminalTabIndexSelector);
	await page.click(TerminalTabIndexSelector);
}

export async function closeTerminalIndex(page: Page, index: number) {
	if (!(await checkTerminalVisibility(page))) await toggleTerminalVisibility(page);
	const TerminalTabCloseButtonIndexSelector = `xpath///div[@role='tab' and @aria-posinset=${index}]//button[normalize-space() = 'close']`;

	await page.waitForSelector(TerminalTabCloseButtonIndexSelector);
	await page.click(TerminalTabCloseButtonIndexSelector);
}

export async function restartShell(page: Page) {
	const MoreButtonSelector = `button[spotlightid="cloud-shell-more-button"]`;
	const RestartButtonSelector = `xpath///button[@role='menuitem' and @tabindex=0]`;
	const RestartConfirmButtonSelector = `xpath///span[normalize-space()='Restart']`;

	await page.waitForSelector(MoreButtonSelector);
	await page.realClick(MoreButtonSelector);

	await page.waitForSelector(RestartButtonSelector);
	await page.realClick(RestartButtonSelector);

	await page.waitForSelector(RestartConfirmButtonSelector);
	await page.realClick(RestartConfirmButtonSelector);

	await page.waitForSelector(`.terminal-spacer`, { timeout: 60000 });
}