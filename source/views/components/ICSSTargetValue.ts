export enum CSSTargetInclude {
	include = "include",
	exclude = "exclude",
}

export interface ICSSTargetValue {
	/**
	 * Internal ID used to make additions and deletions easier.
	 */
	id: number;
	/**
	 * The CSS selector to run.
	 */
	selector: string;
	/**
	 * Whether the selector is inclusive or exclusive.
	 */
	include: CSSTargetInclude;
}
