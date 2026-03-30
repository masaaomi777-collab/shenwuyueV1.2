/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class AssetManager {
  private images: Record<string, HTMLImageElement> = {};
  private loadingPromises: Record<string, Promise<void>> = {};

  async loadImages(sources: Record<string, string>): Promise<void> {
    const promises = Object.entries(sources).map(([name, src]) => {
      // If already loaded, skip
      if (this.images[name]) {
        return Promise.resolve();
      }
      // If currently loading, return the existing promise
      if (this.loadingPromises[name]) {
        return this.loadingPromises[name];
      }

      const loadWithRetry = (attempt: number = 0): Promise<void> => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            console.log(`[AssetManager] Loaded: ${name}`);
            this.images[name] = img;
            delete this.loadingPromises[name];
            resolve();
          };
          img.onerror = (e) => {
            if (attempt < 2) {
              console.warn(`[AssetManager] Retry loading ${name} (attempt ${attempt + 1})`);
              // Add a small delay before retry
              setTimeout(() => {
                resolve(loadWithRetry(attempt + 1));
              }, 500 * (attempt + 1));
            } else {
              console.error(`[AssetManager] Failed: ${name} from ${src}`, e);
              delete this.loadingPromises[name];
              // Resolve anyway to allow the game to proceed with fallbacks
              resolve();
            }
          };
          img.src = src;
        });
      };

      const promise = loadWithRetry();
      this.loadingPromises[name] = promise;
      return promise;
    });

    await Promise.all(promises);
  }

  get(name: string): HTMLImageElement | undefined {
    return this.images[name];
  }

  isLoaded(name: string): boolean {
    return !!this.images[name];
  }

  async loadTileRange(start: number, end: number): Promise<void> {
    const sources: Record<string, string> = {};
    for (let i = start; i <= end; i++) {
      const name = `tile_${i.toString().padStart(4, '0')}`;
      sources[name] = `/res/map/${name}.png`;
    }
    await this.loadImages(sources);
  }
}

export const assets = new AssetManager();
