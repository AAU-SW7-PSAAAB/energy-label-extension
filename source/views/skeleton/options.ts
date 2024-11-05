import { mount } from "svelte";
import Options from "./Options.svelte";
const options = mount(Options, { target: document.getElementById("options")! });

export default options;
