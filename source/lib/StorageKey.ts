import browser from "./browser";
import debug from "./debug";
import type { z } from "zod";

/**
 * Allows you to access a single key in the local extension storage.
 */
export class StorageKey<S extends z.ZodType<unknown>> {
	constructor(key: string, schema: S) {
		this.#key = key;
		this.#schema = schema;
		browser.storage.local.onChanged.addListener((changes) => {
			if (this.#key in changes) {
				this.#dispatchUpdate(changes[this.#key].newValue);
			}
		});
	}
	#key: string;
	#schema: S;
	#listeners: ((data: z.infer<S> | null) => unknown)[] = [];
	#dispatchUpdate(data: z.infer<S> | null): void {
		for (const listener of this.#listeners) {
			listener(data);
		}
	}
	/**
	 * Helper function that will call a function once every time the value changes.
	 */
	update(listener: (data: z.infer<S> | null) => unknown): void {
		this.#listeners.push(listener);
	}
	/**
	 * Helper function that will call a function once on startup, then once every time the value changes.
	 */
	async initAndUpdate(
		listener: (data: z.infer<S> | null) => unknown,
	): Promise<void> {
		this.update(listener);
		await listener(await this.get());
	}
	/**
	 * Checks if any data is saved for this key.
	 */
	async has(): Promise<boolean> {
		const data = await browser.storage.local.get(this.#key);
		return Boolean(this.#key in data);
	}
	/**
	 * Gets the value in the storage, or if there is no/bad data, returns null.
	 */
	async get(): Promise<z.infer<S> | null> {
		const data = await browser.storage.local.get(this.#key);
		if (!(this.#key in data)) {
			return null;
		}
		const parseResult = this.#schema.safeParse(data[this.#key]);
		if (parseResult.success) {
			return parseResult.data;
		} else {
			debug.warn(
				`Wrong information in storage "${this.#key}": ${parseResult.error}`,
			);
			return null;
		}
	}
	/**
	 * Checks if the provided value is equal to the value in the storage (strict equals).
	 */
	async is(data: z.infer<S>): Promise<boolean> {
		const current = await this.get();
		return Boolean(current === data);
	}
	/**
	 * Sets the value in the storage.
	 */
	async set(data: z.infer<S>): Promise<void> {
		debug.debug(`Storage key "${this.#key}" set:`, data);
		await browser.storage.local.set({ [this.#key]: data });
	}
	/**
	 * Deletes the value in the storage.
	 */
	async clear(): Promise<void> {
		await browser.storage.local.remove(this.#key);
	}
}
