// @ts-expect-error - paper is used for type annotations only
import type paper from "paper";
import { GameWorld } from "./GameWorld";

/**
 * 游戏实体基类
 * 所有游戏中的对象都应该继承此类
 */
export abstract class GameEntity {
  protected position: paper.Point;
  protected gameWorld: GameWorld;
  protected visible: boolean = true;

  constructor(gameWorld: GameWorld, initialPosition: paper.Point) {
    this.gameWorld = gameWorld;
    this.position = initialPosition.clone();
  }

  /**
   * 获取当前位置
   */
  getPosition(): paper.Point {
    return this.position.clone();
  }

  /**
   * 设置位置
   */
  setPosition(position: paper.Point) {
    this.position = position.clone();
  }

  /**
   * 获取X坐标
   */
  getX(): number {
    return this.position.x;
  }

  /**
   * 获取Y坐标
   */
  getY(): number {
    return this.position.y;
  }

  /**
   * 设置可见性
   */
  setVisible(visible: boolean) {
    this.visible = visible;
  }

  /**
   * 是否可见
   */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * 更新逻辑（每帧调用）
   */
  abstract update(deltaTime: number): void;

  /**
   * 渲染（每帧调用）
   */
  abstract render(): void;

  /**
   * 销毁
   */
  abstract destroy(): void;
}
