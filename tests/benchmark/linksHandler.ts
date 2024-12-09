import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export function getCurrentDir(): string {
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
