const Config = {
	serverAddress:
		import.meta.env?.MODE === "benchmark"
			? "127.0.0.1:3000"
			: "130.225.39.16",
	analysisResultTimeout: 10000,
};

export default Config;
