import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

const config: PlaywrightTestConfig = {
	webServer: {
		command: "vite build --mode test",
	},
	testDir: "tests/e2e",
	testMatch: /(.+\.)?test\.ts/,
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
};

export default config;
