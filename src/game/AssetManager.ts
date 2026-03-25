/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class AssetManager {
  private images: Record<string, HTMLImageElement> = {};
  private loadedCount = 0;
  private totalCount = 0;

  loadImages(sources: Record<string, string>): Promise<void> {
    const entries = Object.entries(sources);
    this.totalCount = entries.length;
    this.loadedCount = 0;
    
    return new Promise((resolve) => {
      if (this.totalCount === 0) {
        resolve();
        return;
      }

      entries.forEach(([name, src]) => {
        const img = new Image();
        img.onload = () => {
          console.log(`Asset loaded: ${name} from ${src}`);
          this.images[name] = img;
          this.loadedCount++;
          if (this.loadedCount === this.totalCount) resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${src}`);
          this.loadedCount++;
          if (this.loadedCount === this.totalCount) resolve();
        };
        img.src = src;
      });
    });
  }

  get(name: string): HTMLImageElement | undefined {
    return this.images[name];
  }
}

export const assets = new AssetManager();
