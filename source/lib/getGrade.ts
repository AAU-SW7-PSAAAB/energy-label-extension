export default function getGrade(score: number) {
	if (score >= 100) return "A";
	if (score >= 80) return "B";
	if (score >= 60) return "C";
	if (score >= 40) return "D";
	if (score >= 20) return "E";
	return "F";
}
