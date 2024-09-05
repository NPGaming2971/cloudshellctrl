import { connect } from "puppeteer-real-browser";
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

main();
