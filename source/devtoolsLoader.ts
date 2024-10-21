import { mount } from "svelte";
import Devtools from "./DevtoolsLoader.svelte";

const devtools = mount(Devtools, {
	target: document.getElementById("devtools")!,
});

export default devtools;
