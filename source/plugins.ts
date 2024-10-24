import { IPluginSchema, type IPlugin } from "./lib/pluginTypes";

const modules = import.meta.glob("./plugins/*.ts", { eager: true });

export default Object.values(modules)
	.map((module) => (module as { default: IPlugin }).default)
	.filter((plugin) => IPluginSchema.safeParse(plugin).success);
