import { connect } from "puppeteer-real-browser";
import PuppeteerStealthPlugin from "puppeteer-extra-plugin-stealth";
import { ChromeFlags } from "./constants.js";

async function main() {
	const { page } = await connect({
		headless: false,
		args: ChromeFlags,
		turnstile: false,
		connectOption: {
			ignoreHTTPSErrors: true,
		},
		plugins: [PuppeteerStealthPlugin()],
	});

	await page.goto("https://shell.cloud.google.com", { waitUntil: 'domcontentloaded' });

}

main();
