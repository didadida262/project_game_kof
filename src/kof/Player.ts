import { GameWorld } from "./GameWorld";

// 人物状态接口
export interface PlayerState {
  x: number; // 水平位置（Paper.js坐标系）
  y: number; // 垂直位置（Paper.js坐标系，从顶部计算）
  velocityX: number; // 水平速度
  velocityY: number; // 垂直速度（用于跳跃）
  isJumping: boolean; // 是否在跳跃
  isCrouching: boolean; // 是否在下蹲
  isOnGround: boolean; // 是否在地面上
  groundY: number; // 地面Y坐标
  scale: number; // 缩放比例（用于下蹲）
}

// 人物配置接口
export interface PlayerConfig {
  moveSpeed?: number; // 移动速度
  jumpSpeed?: number; // 跳跃初始速度
  gravity?: number; // 重力加速度
  crouchScale?: number; // 下蹲时的缩放比例
  normalScale?: number; // 正常时的缩放比例
  scaleTransitionSpeed?: number; // 缩放过渡速度
  playerWidth?: number; // 人物宽度（用于边界检测）
}

// 默认配置
const DEFAULT_CONFIG: Required<PlayerConfig> = {
  moveSpeed: 5,
  jumpSpeed: 15,
  gravity: 0.8,
  crouchScale: 0.7,
  normalScale: 1.25,
  scaleTransitionSpeed: 0.15,
  playerWidth: 200,
};

/**
 * 人物控制类
 * 基于Paper.js坐标系（右正下正）
 */
export class Player {
  private state: PlayerState;
  private config: Required<PlayerConfig>;
  private gameWorld: GameWorld;

  constructor(
    gameWorld: GameWorld,
    initialX: number,
    config: PlayerConfig = {},
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.gameWorld = gameWorld;
    const groundY = gameWorld.getGroundY();

    this.state = {
      x: initialX,
      y: groundY,
      velocityX: 0,
      velocityY: 0,
      isJumping: false,
      isCrouching: false,
      isOnGround: true,
      groundY: groundY,
      scale: this.config.normalScale,
    };
  }

  /**
   * 获取当前状态
   */
  getState(): PlayerState {
    return { ...this.state };
  }

  /**
   * 更新地面线（当游戏世界配置改变时调用）
   */
  updateGroundY() {
    const newGroundY = this.gameWorld.getGroundY();
    // 如果当前在地面上，同步更新Y坐标
    if (this.state.isOnGround && !this.state.isJumping) {
      this.state.y = newGroundY;
    }
    this.state.groundY = newGroundY;
  }

  /**
   * 向左移动
   */
  moveLeft() {
    this.state.velocityX = -this.config.moveSpeed;
  }

  /**
   * 向右移动
   */
  moveRight() {
    this.state.velocityX = this.config.moveSpeed;
  }

  /**
   * 停止水平移动
   */
  stopHorizontalMovement() {
    this.state.velocityX = 0;
  }

  /**
   * 跳跃
   */
  jump() {
    if (this.state.isOnGround && !this.state.isJumping) {
      this.state.isJumping = true;
      this.state.isOnGround = false;
      this.state.velocityY = -this.config.jumpSpeed;
    }
  }

  /**
   * 开始下蹲
   */
  startCrouch() {
    this.state.isCrouching = true;
  }

  /**
   * 停止下蹲
   */
  stopCrouch() {
    this.state.isCrouching = false;
  }

  /**
   * 更新人物状态（在游戏循环中调用）
   */
  update() {
    const bounds = this.gameWorld.getBounds();
    const viewWidth = bounds.width;

    // 水平移动
    if (this.state.velocityX !== 0) {
      this.state.x += this.state.velocityX;
      // 限制在屏幕范围内（左右各留一半空间给两个玩家）
      const halfWidth = this.config.playerWidth / 2;
      const leftBound = halfWidth;
      const rightBound = viewWidth / 2 - halfWidth; // 左半部分
      this.state.x = Math.max(leftBound, Math.min(rightBound, this.state.x));
    }

    // 跳跃和重力（Paper.js坐标系：Y向下为正）
    if (this.state.isJumping) {
      this.state.velocityY += this.config.gravity; // 重力向下，velocityY增加
      this.state.y += this.state.velocityY; // Y向下增加

      // 检查是否落地（Y坐标不能超过地面线）
      if (this.state.y >= this.state.groundY) {
        this.state.y = this.state.groundY;
        this.state.velocityY = 0;
        this.state.isJumping = false;
        this.state.isOnGround = true;
      }
    }

    // 下蹲处理 - 不再使用缩放，而是通过姿态变化实现
    // scale保持为normalScale，下蹲效果由StickFigureRenderer的姿态系统处理
    this.state.scale = this.config.normalScale;
  }

  /**
   * 重置位置
   */
  resetPosition(x: number) {
    const groundY = this.gameWorld.getGroundY();
    this.state.x = x;
    this.state.y = groundY;
    this.state.groundY = groundY;
    this.state.velocityX = 0;
    this.state.velocityY = 0;
    this.state.isJumping = false;
    this.state.isOnGround = true;
  }
}
