import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";
import "dotenv/config";

// Determine the test directory based on NODE_ENV
const testDirectory =
	{
		"benchmark-performance": "tests/benchmark/performance",
		"benchmark-availability": "tests/benchmark/availability",
	}[process.env.NODE_ENV ?? ""] || "tests/e2e";

const config: PlaywrightTestConfig = {
	webServer: {
		command: `vite dev tests/e2e/test-sites --port ${process.env.E2E_PORT || 5173}`,
	},
	testDir: testDirectory,
	testMatch: /(.+\.)?test\.ts/,
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
};

export default config;
