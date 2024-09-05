import { Browser, getInstalledBrowsers, install } from "@puppeteer/browsers";
import * as path from "node:path";

export async function getIsolatedBrowserPath(version?: string) {
	const DefaultVersion = "128.0.6613.118";
	const installedBrowsers = await getInstalledBrowsers({ cacheDir: path.resolve(".") });
	if (!installedBrowsers.length) {
		const installed = await install({
			browser: Browser.CHROME,
			unpack: true,
			buildId: version || DefaultVersion,
			cacheDir: path.resolve("."),
		});

		return installed.executablePath;
	}

	return installedBrowsers[0].executablePath;
}

