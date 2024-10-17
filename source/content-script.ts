chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "changeBackgroundColor") {
		const originalColor = document.body.style.backgroundColor;

		let count = 0;
		const interval = setInterval(() => {
			document.body.style.backgroundColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
			if (count++ > 20) {
				clearInterval(interval);
				document.body.style.backgroundColor = originalColor;
				sendResponse({ status: "success" });
			}
		}, 100);

		return true;
	}
});
