class Debug {
	/**
	 * Log low-level debug information.
	 */
	debug(...args: any[]) {
		console.info(...args);
	}
	/**
	 * Log warnings about something.
	 */
	warn(...args: any[]) {
		console.warn(...args);
	}
}

export default new Debug();
