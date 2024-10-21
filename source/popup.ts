import { mount } from "svelte";
import Popup from "./Popup.svelte";

const popup = mount(Popup, { target: document.getElementById("popup")! });

export default popup;
