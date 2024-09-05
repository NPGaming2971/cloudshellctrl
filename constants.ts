export const ChromeFlags = [
	'--js-flags="--max-old-space-size=128',
	"--disable-setuid-sandbox",
	"--disable-dev-shm-usage",
	"--disable-gpu",
	"--no-zygote",
	"--disable-software-rasterizer",
	"--disable-logging",
	"--disable-blink-features=AutomationControlled",
	"--disable-webrtc",
	"--disable-webgl",
	"--disable-accelerated-2d-canvas",
	"--disable-accelerated-video-decode",
	"--no-experiments",
	"--disable-checker-imaging",
	"--disable-gl-drawing-for-tests",
	"--disable-reading-from-canvas",
	"--disable-background-timer-throttling",
	"--disable-backgrounding-occluded-windows",
	"--disable-remote-fonts",
	"--noerrdialogs",
	"--disable-component-extensions-with-background-pages",
	"--renderer-process-limit=1",
	"--force-low-memory-device",
	"--force-device-scale-factor=1",
	"--disable-gpu-program-cache",
	"--disk-cache-size=0",
	"--force-gpu-mem-available-mb=0",
	"--deny-permission-prompts",
	"--hide-scrollbars",
	"--aggressive-cache-discard",
	"--no-pings",
	"--disable-ipc-flooding-protection",
	"--disable-site-engagement-service",
	"--window-size=800,600",
	"--incognito",
	"--disable-save-password-bubble",
	"--disable-client-side-phishing-detection",
	"--disable-background-networking",
	"--disable-renderer-accessibility",
	"--disable-domain-reliability",
	"--disable-audio-output",
	"--disable-renderer-backgrounding",
	"--disable-hang-monitor",
	"--enable-low-end-device-mode",
	"--disable-3d-apis",
	"--disable-site-isolation-trials",
	"--disable-notifications",
	"--disable-default-apps",
	"--no-default-browser-check",
	"--no-first-run",
	"--ash-no-nudges",
	"--disable-search-engine-choice-screen",
	"--in-process-gpu",
	"--block-new-web-contents",
];
