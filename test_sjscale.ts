import { SkeletonJson } from '@esotericsoftware/spine-canvas';
const sj = Object.create(SkeletonJson.prototype);
console.log('scale' in sj);
