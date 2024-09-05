import { Browser, getInstalledBrowsers, install } from "@puppeteer/browsers";
import * as path from "node:path";

//@ts-expect-error
async function getIsolatedBrowserPath(version?: string) {
	const DefaultVersion = "114.0.5735.133";
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

