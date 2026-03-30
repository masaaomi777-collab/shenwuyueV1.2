import { AssetManager } from '@esotericsoftware/spine-canvas';
const am = new AssetManager("");
am.loadJson("test.json");
console.log(am.isLoadingComplete());
