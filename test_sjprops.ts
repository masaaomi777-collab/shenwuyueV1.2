import { SkeletonJson } from '@esotericsoftware/spine-canvas';
const sj = Object.create(SkeletonJson.prototype);
console.log(Object.keys(sj));
console.log(Object.getOwnPropertyNames(SkeletonJson.prototype));
