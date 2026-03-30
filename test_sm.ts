import { spineManager } from './src/game/SpineManager.js';

async function test() {
    try {
        await spineManager.load();
        console.log("Success!");
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
