import { mount } from "svelte";
import Devtools from "./Devtools.svelte";

const devtools = mount(Devtools, {
	target: document.getElementById("devtools")!,
});

export default devtools;
