export default "browser" in globalThis
	? globalThis.browser
	: ((globalThis as any).chrome as typeof browser);
