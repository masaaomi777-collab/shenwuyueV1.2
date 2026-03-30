import { Skeleton } from '@esotericsoftware/spine-canvas';
const skeleton = Object.create(Skeleton.prototype);
console.log("yDown in skeleton?", 'yDown' in skeleton);
