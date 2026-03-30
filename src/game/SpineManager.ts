import { 
  AssetManager, 
  AtlasAttachmentLoader, 
  SkeletonJson, 
  SkeletonData, 
  AnimationStateData, 
  AnimationState, 
  SkeletonRenderer,
  Skeleton,
  Physics
} from "@esotericsoftware/spine-canvas";

export class SpineFortress {
  private skeleton: Skeleton;
  private animationState: AnimationState;
  private currentRotation: number = 0;
  private targetRotation: number = 0;
  private rotationSpeed: number = 8; // Radians per second, slightly slower for smoother feel
  private initialized: boolean = false;

  constructor(skeletonData: SkeletonData) {
    this.skeleton = new Skeleton(skeletonData);
    // User requested "缩小一倍" (scale down by half).
    // Previous scale was 0.4, so 0.2 is half.
    this.skeleton.scaleX = 0.2;
    this.skeleton.scaleY = 0.2;
    this.animationState = new AnimationState(new AnimationStateData(skeletonData));
  }

  setAnimation(name: string, loop: boolean, interruptible: boolean = true) {
    const current = this.animationState.getCurrent(0);
    if (current && current.animation.name === name) return;
    
    // If current animation is non-interruptible and not finished, don't change
    if (current && current.animation.name === 'atked' && !current.isComplete()) {
        return;
    }

    this.animationState.setAnimation(0, name, loop);
  }

  update(dt: number) {
    this.animationState.update(dt);
    this.animationState.apply(this.skeleton);
    
    if (!this.initialized) return;

    // Smooth rotation transition
    let diff = this.targetRotation - this.currentRotation;
    // Normalize angle difference to [-PI, PI]
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    
    if (Math.abs(diff) > 0.001) {
        const step = this.rotationSpeed * dt;
        if (Math.abs(diff) <= step) {
            this.currentRotation = this.targetRotation;
        } else {
            this.currentRotation += Math.sign(diff) * step;
        }
    } else {
        this.currentRotation = this.targetRotation;
    }

    this.skeleton.updateWorldTransform(Physics.update);
  }

  render(ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number) {
    if (!this.initialized) {
        this.currentRotation = rotation;
        this.targetRotation = rotation;
        this.initialized = true;
    } else {
        this.targetRotation = rotation;
    }

    ctx.save();
    ctx.translate(x, y);
    
    // Use current rotation directly as requested
    ctx.rotate(this.currentRotation);
    
    this.skeleton.scaleX = 0.2;
    this.skeleton.scaleY = -0.2; // Spine's Y axis points UP, Canvas Y axis points DOWN.
    
    const renderer = new SkeletonRenderer(ctx);
    renderer.triangleRendering = true;
    
    // Offset to the right relative to heading (Lateral offset)
    // In the rotated context, X is forward, Y is right.
    // Using a value of 40 for the lateral offset.
    ctx.translate(0, 40); 
    
    this.skeleton.x = 0;
    this.skeleton.y = 0;
    
    this.skeleton.updateWorldTransform(Physics.update);
    renderer.draw(this.skeleton);
    
    ctx.restore();
  }
}

export class SpineManager {
  private assetManager: AssetManager;
  private skeletonData: SkeletonData | null = null;

  constructor() {
    this.assetManager = new AssetManager("");
  }

  async load() {
    const baseUrl = "/res/role/C001/";
    this.assetManager.loadJson(baseUrl + "skeleton.json");
    this.assetManager.loadTextureAtlas(baseUrl + "skeleton.atlas");

    try {
        await this.assetManager.loadAll();
        
        if (this.assetManager.hasErrors()) {
            throw new Error("Errors loading assets: " + JSON.stringify(this.assetManager.getErrors()));
        }

        const atlas = this.assetManager.require(baseUrl + "skeleton.atlas");
        const atlasLoader = new AtlasAttachmentLoader(atlas);
        const skeletonJson = new SkeletonJson(atlasLoader);
        const skeletonRawData = this.assetManager.require(baseUrl + "skeleton.json");
        this.skeletonData = skeletonJson.readSkeletonData(skeletonRawData);
        console.log("Spine skeleton data loaded successfully from /res/role/C001/");
    } catch (e) {
        console.error("Spine load error:", e);
        throw e;
    }
  }

  createFortress() {
    if (!this.skeletonData) return null;
    return new SpineFortress(this.skeletonData);
  }
}

export const spineManager = new SpineManager();
