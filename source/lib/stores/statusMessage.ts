import { writable, type Writable } from "svelte/store";

const statusMessageStore: Writable<string[]> = writable([]);

export default statusMessageStore;
