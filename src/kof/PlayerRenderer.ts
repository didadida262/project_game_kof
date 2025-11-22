import paper from "paper";
import { Player, PlayerState } from "./Player";
import { StickFigureRenderer, StickFigureConfig } from "./StickFigureRenderer";

/**
 * 人物渲染器
 * 负责将Player状态渲染到Paper.js画布上
 * 使用火柴人渲染
 */
export class PlayerRenderer {
  private stickFigureRenderer: StickFigureRenderer;
  private layer: paper.Layer;
  private player: Player;

  constructor(
    player: Player,
    layer: paper.Layer,
    config: StickFigureConfig = {},
  ) {
    this.player = player;
    this.layer = layer;
    this.stickFigureRenderer = new StickFigureRenderer(layer, config);
  }

  /**
   * 更新位置和状态
   */
  update(state: PlayerState) {
    this.stickFigureRenderer.update(state);
  }

  /**
   * 设置可见性
   */
  setVisible(visible: boolean) {
    this.stickFigureRenderer.setVisible(visible);
  }

  /**
   * 销毁
   */
  destroy() {
    this.stickFigureRenderer.destroy();
  }
}
