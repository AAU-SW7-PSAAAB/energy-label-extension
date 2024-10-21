class Debug {
	/**
	 * Log low-level debug information.
	 */
	debug(...args: any[]) {
		if(import.meta.env.DEV) console.info(...args);
	}
	/**
	 * Log warnings about something.
	 */
	warn(...args: any[]) {
		// TODO: add some telemetry here
		if(import.meta.env.DEV) console.warn(...args);
	}
	/**
	 * Log serious errors that are breaking something.
	 */
	error(...args: any[]) {
		// TODO: add some telemetry here
		console.error(...args);
	}
}

export default new Debug();
