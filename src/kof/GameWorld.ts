import paper from "paper";

/**
 * 游戏世界配置
 * 管理游戏世界的基础参数，如地面线、边界等
 */
export interface GameWorldConfig {
  groundY?: number; // 地面线Y坐标（Paper.js坐标系，从顶部计算）
  viewWidth?: number; // 视图宽度
  viewHeight?: number; // 视图高度
}

/**
 * 游戏世界类
 * 负责管理游戏世界的基础设置和坐标系
 */
export class GameWorld {
  private config: Required<GameWorldConfig>;
  private view: paper.View;

  constructor(view: paper.View, config: GameWorldConfig = {}) {
    this.view = view;
    const bounds = view.bounds;

    // 默认配置：地面线在视图高度的85%位置（约700/822）
    const defaultGroundY = config.groundY ?? bounds.height * 0.85;

    this.config = {
      groundY: defaultGroundY,
      viewWidth: bounds.width,
      viewHeight: bounds.height,
      ...config,
    };
  }

  /**
   * 获取地面线Y坐标
   */
  getGroundY(): number {
    return this.config.groundY;
  }

  /**
   * 设置地面线Y坐标
   */
  setGroundY(y: number) {
    this.config.groundY = y;
  }

  /**
   * 获取视图宽度
   */
  getViewWidth(): number {
    return this.config.viewWidth;
  }

  /**
   * 获取视图高度
   */
  getViewHeight(): number {
    return this.config.viewHeight;
  }

  /**
   * 获取视图边界
   */
  getBounds(): paper.Rectangle {
    return this.view.bounds;
  }

  /**
   * 更新视图尺寸（当窗口大小改变时调用）
   */
  updateViewSize() {
    const bounds = this.view.bounds;
    this.config.viewWidth = bounds.width;
    this.config.viewHeight = bounds.height;
  }

  /**
   * 检查点是否在地面上
   */
  isOnGround(y: number, tolerance: number = 1): boolean {
    return Math.abs(y - this.config.groundY) <= tolerance;
  }

  /**
   * 将Y坐标限制在地面线以上
   */
  clampToGround(y: number): number {
    return Math.min(y, this.config.groundY);
  }
}
