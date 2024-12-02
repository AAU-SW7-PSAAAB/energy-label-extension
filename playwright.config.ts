import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";
import "dotenv/config";

const config: PlaywrightTestConfig = {
	webServer: {
		command: `vite dev tests/e2e/test-sites --port ${process.env.E2E_PORT || 5173}`,
	},
	testDir: "tests/e2e",
	testMatch: /(.+\.)?test\.ts/,
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	retries: 2,
};

export default config;
