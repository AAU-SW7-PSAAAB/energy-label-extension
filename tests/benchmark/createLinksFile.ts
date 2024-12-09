import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import z from "zod";

function getCurrentDir(): string {
	// Get the directory of the current script file and create absolute path
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	return __dirname;
}

export function getLinks(
	n: number = 1000,
	exportToTSFile: boolean = false,
): string[] {
	const __dirname = getCurrentDir();
	const filePath = join(__dirname, "tranco_QG634_top1000.csv");

	const links: string[] = [];
	const file = readFileSync(filePath, "utf-8");
	const lines = file.split("\n");
	lines.forEach((line) => {
		const link = line.split(",")[1];
		if (link) links.push(link.trim());
	});

	const slicedLinks = links.slice(0, n);

	if (exportToTSFile) {
		// Format the output as a TypeScript file
		const tsContent = `export const links: string[] = [
			"${slicedLinks.join('",\n    "')}"
		];`;

		// Write the output to a file
		writeFileSync(join(__dirname, "links.ts"), tsContent, "utf-8");
	}

	return slicedLinks;
}

export function exportTimeDifferenceCsv(
	timeDifferences: Record<string, Record<string, number>>,
) {
	const __dirname = getCurrentDir();

	// Convert the array to a CSV string
	let csvContent = "";

	for (const test of Object.entries(timeDifferences)) {
		for (const pluginTest of Object.entries(test[1])) {
			csvContent += `${test[0]},${pluginTest[0]},${pluginTest[1]}\n`;
		}
	}

	const json = JSON.stringify(timeDifferences);

	writeFileSync(
		join(__dirname, "result_timeBeforeFirstResult.csv"),
		csvContent,
		"utf-8",
	);

	writeFileSync(
		join(__dirname, "result_timeBeforeFirstResult.json"),
		json,
		"utf-8",
	);
}

const websiteMetricsSchema = z.object({
	Format: z.number().optional(),
	"Text compression": z.number().optional(),
	"User preference": z.number().optional(),
});

const BenchmarkDataSchema = z.record(z.string(), websiteMetricsSchema);

function processDataFile(fileName: string, interval: number = 0.1) {
	const __dirname = getCurrentDir();
	const filePath = join(__dirname, fileName);

	const file = JSON.parse(readFileSync(filePath, "utf-8"));
	const parsedFile = BenchmarkDataSchema.safeParse(file);

	if (!parsedFile.success) {
		console.log(parsedFile.error);
		return;
	}

	const intervalDict = new Map<string, Map<number, number>>();

	Object.entries(parsedFile.data).forEach((website) => {
		Object.entries(website[1]).forEach((entry) => {
			const val = entry[1];
			const intervalIndex = Math.floor(val / interval);

			const plugin =
				intervalDict.get(entry[0]) || new Map<number, number>();
			plugin.set(intervalIndex, (plugin.get(intervalIndex) || 0) + 1);

			intervalDict.set(entry[0], plugin);
		});
	});

	intervalDict.entries().forEach((plugin) => {
		const sortedIntervals = Array.from(plugin[1].entries()).sort(
			(a, b) => a[0] - b[0],
		);
		let aggregatedData = "";

		sortedIntervals.forEach(([intervalIndex, count]) => {
			const intervalStart = (intervalIndex * interval).toFixed(2);
			const intervalEnd = ((intervalIndex + 1) * interval).toFixed(2);
			console.log(`[${intervalStart}-${intervalEnd}],${count}`);
			aggregatedData += `[${intervalStart}-${intervalEnd}],${count}\n`;
		});

		writeFileSync(
			join(__dirname, `result_aggregatedData_${plugin[0]}.csv`),
			aggregatedData,
			"utf-8",
		);
	});
}

processDataFile("timeBeforeFirstResult.json");
