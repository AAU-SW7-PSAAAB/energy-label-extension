import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

function getCurrentDir(): string {
	// Get the directory of the current script file and create absolute path
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	return __dirname
}

export function getLinks(n: number = 1000, exportToTSFile: boolean = false): string[] {
	const __dirname = getCurrentDir();
	const filePath = join(__dirname, 'tranco_QG634.csv');

	const links: string[] = []
	const file = readFileSync(filePath, 'utf-8');
	const lines = file.split('\n')
	lines.forEach((line) => {
		const link = line.split(",")[1];
		if (link) links.push(link.trim());
	})

	const slicedLinks = links.slice(0, n);

	if (exportToTSFile) {
		// Format the output as a TypeScript file
		const tsContent = `export const links: string[] = [
			"${slicedLinks.join('",\n    "')}"
		];`;

		// Write the output to a file
		writeFileSync(join(__dirname, 'links.ts'), tsContent, 'utf-8');
	}

	return slicedLinks
}

export function exportTimeDifferenceCsv(timeDifferences: number[]) {
	const __dirname = getCurrentDir();

	// Convert the array to a CSV string
	const csvContent = timeDifferences.join("\n");
	writeFileSync(join(__dirname, 'timeBeforeFirstResult.csv'), csvContent, 'utf-8');
}

function processDataFile(fileName: string, interval: number = 0.1) {
	const __dirname = getCurrentDir()
	const filePath = join(__dirname, fileName)

	const file = readFileSync(filePath, 'utf-8');
	const lines = file.split('\n')

	const intervalDict = new Map<number, number>()
	lines.forEach((line) => {
		const val = parseFloat(line);
		const intervalIndex = Math.floor(val / interval);
		intervalDict.set(intervalIndex, (intervalDict.get(intervalIndex) || 0) + 1);
	});

	const sortedIntervals = Array.from(intervalDict.entries()).sort((a, b) => a[0] - b[0]);
	let aggregatedData = ""

	sortedIntervals.forEach(([intervalIndex, count]) => {
		const intervalStart = (intervalIndex * interval).toFixed(2);
		const intervalEnd = ((intervalIndex + 1) * interval).toFixed(2);
		console.log(`[${intervalStart}-${intervalEnd}],${count}`);
		aggregatedData += `[${intervalStart}-${intervalEnd}],${count}\n`
	});

	writeFileSync(join(__dirname, 'aggregatedData.csv'), aggregatedData, 'utf-8');
}

processDataFile("timeBeforeFirstResult.csv")
