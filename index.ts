import { connect, type PageWithCursor } from "puppeteer-real-browser";
import PuppeteerStealthPlugin from "puppeteer-extra-plugin-stealth";
import { getIsolatedBrowserPath } from "./utils.js";
import { ChromeFlags } from "./constants.js";

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
			ignoreHTTPSErrors: true,
		},
		plugins: [PuppeteerStealthPlugin()],
	});

	await page.goto("https://shell.cloud.google.com", { waitUntil: "domcontentloaded" });
}

async function loginToGoogle(page: PageWithCursor, email: string, password: string) {
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

main();
