const grades = ["G", "F", "E", "D", "C", "B", "A"];

export default function getGrade(score: number) {
	return grades[Math.min(Math.floor(score / (100 / grades.length)), 6)];
}
