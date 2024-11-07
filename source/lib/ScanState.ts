import debug from "./debug";
import { z } from "zod";
import { StorageKey } from "./StorageKey";

const STATE_KEY = "ScanState";

/**
 * All the possible scanning states of the plugin
 */
export enum ScanStates {
	/**
	 * When the plugin is not doing anything.
	 * The user might be setting up a scan, or might be looking at the results of a scan.
	 */
	Idle = "Idle",
	/**
	 * When loading should begin.
	 */
	BeginLoad = "BeginLoad",
	/**
	 * While the website is being reloaded and network information is being collected.
	 */
	LoadNetwork = "LoadNetwork",
	/**
	 * When the network scan has finished and we are waiting for the next thing to happen.
	 */
	LoadNetworkFinished = "LoadNetworkFinished",
	/**
	 * While the extension is loading content in from the website.
	 */
	LoadContent = "LoadContent",
	/**
	 * When the content loading has finished and we are waiting for the next thing to happen.
	 */
	LoadContentFinished = "LoadContentFinished",
	/**
	 * WHen all information has been collected and the plugins need to run analysis.
	 */
	Analyze = "Analyze",
}

/**
 * Defines which global states can transition to which
 */
const transitions: Record<ScanStates, ScanStates[]> = {
	/**
	 * Make it clear that we want to start a scan.
	 */
	[ScanStates.Idle]: [ScanStates.BeginLoad],
	/**
	 * Start the first collection process.
	 * If it includes network info do that first, otherwise skip directly to content.
	 */
	[ScanStates.BeginLoad]: [ScanStates.LoadNetwork, ScanStates.LoadContent],
	/**
	 * When the network scan has finished.
	 */
	[ScanStates.LoadNetwork]: [ScanStates.LoadNetworkFinished],
	/**
	 * Now move on from the network scan to loading content, or straight to analysis.
	 */
	[ScanStates.LoadNetworkFinished]: [
		ScanStates.LoadContent,
		ScanStates.Analyze,
	],
	/**
	 * When the content scan has finished.
	 */
	[ScanStates.LoadContent]: [ScanStates.LoadContentFinished],
	/**
	 * Now move on from the network scan to loading content, or straight to analysis.
	 */
	[ScanStates.LoadContentFinished]: [ScanStates.Analyze],
	/**
	 * After analysis, we can return to idle.
	 */
	[ScanStates.Analyze]: [ScanStates.Idle],
} as const;

/**
 * Allows you to get and set the global state of the plugin.
 */
class ScanState extends StorageKey<z.ZodNativeEnum<typeof ScanStates>> {
	constructor() {
		super(STATE_KEY, z.nativeEnum(ScanStates));
	}
	/**
	 * Transition to a new state.
	 */
	async set(state: ScanStates): Promise<void> {
		if (import.meta.env.DEV) {
			const current = await this.get();
			const allowedNewStates = transitions[current];
			if (!allowedNewStates.includes(state)) {
				const message = `Tried to transition from state ${current} to ${state}, but you may only transition to states ${allowedNewStates}`;
				debug.error(message);
				throw new Error(message);
			}
		}
		await super.set(state);
	}
	/**
	 * Get the current state.
	 */
	async get(): Promise<ScanStates> {
		return (await super.get()) || ScanStates.Idle;
	}
	/**
	 * Reset the state back to idle.
	 */
	async clear(): Promise<void> {
		await this.set(ScanStates.Idle);
	}
	/**
	 * Helper function that will call a function once every time the state changes.
	 */
	update(listener: (data: ScanStates) => unknown): void {
		super.update(listener as (data: ScanStates | null) => unknown);
	}
	/**
	 * Helper function that will call a function once on startup, then once every time the state changes.
	 */
	async initAndUpdate(func: (data: ScanStates) => unknown): Promise<void> {
		this.update(func);
		await func(await this.get());
	}
}

export const scanState = new ScanState();
