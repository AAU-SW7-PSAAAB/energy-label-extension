const browserInstance =
	"browser" in globalThis
		? globalThis.browser
		: ((globalThis as any).chrome as typeof browser);

(async () => {
	await import(browserInstance.runtime.getURL("content.js"));
})();
