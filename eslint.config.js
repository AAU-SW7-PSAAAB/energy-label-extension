import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default [
	{
		files: ["**/*.{js,ts}"],
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.webextensions,
			},
		},
	},
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	prettier,
	{
		ignores: ["dist", "publish", "xcode"],
	},
	{
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
		},
	},
];
