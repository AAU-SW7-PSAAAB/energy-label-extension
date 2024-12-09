import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getCurrentDir } from "../linksHandler";
import z from "zod";

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

	processDataFile("timeBeforeFirstResult.json");
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
