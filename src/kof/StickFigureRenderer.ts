import paper from "paper";
import { PlayerState } from "./Player";
import {
  StickFigure,
  StickFigureKeypoints,
  StickFigureConfig,
} from "./StickFigure";

/**
 * 火柴人姿态
 */
export enum StickFigurePose {
  IDLE = "idle", // 站立
  CROUCH = "crouch", // 下蹲
  JUMP = "jump", // 跳跃
  WALK_LEFT = "walk_left", // 向左走
  WALK_RIGHT = "walk_right", // 向右走
}

/**
 * 火柴人渲染器
 * 使用StickFigure类来渲染火柴人，支持不同姿态和方向
 */
export class StickFigureRenderer {
  private stickFigure: StickFigure;
  private layer: paper.Layer;
  private config: Required<StickFigureConfig>;
  private facingRight: boolean = true; // 面向右侧
  private currentPose: StickFigurePose = StickFigurePose.IDLE; // 当前姿态

  // 动画插值状态
  private targetPose: StickFigurePose = StickFigurePose.IDLE;
  private poseInterpolation: number = 1.0; // 0-1之间，1表示完全到达目标姿态
  private animationSpeed: number = 0.2; // 动画速度

  // 目标关键点
  private targetKeypoints: StickFigureKeypoints;
  private currentKeypoints: StickFigureKeypoints;
  private baseKeypoints: StickFigureKeypoints; // 基础关键点（用于计算相对位置）

  // 行走动画时间
  private walkAnimationTime: number = 0;

  constructor(layer: paper.Layer, config: StickFigureConfig = {}) {
    this.layer = layer;

    // 根据视图高度自动计算大小
    const viewHeight = config.viewHeight || 822;
    const autoSize = viewHeight * 0.4; // 从0.28增加到0.4，使身体更大

    this.config = {
      size: config.size || autoSize,
      color: config.color || "#000000",
      strokeWidth: config.strokeWidth || Math.max(4, autoSize * 0.005),
      headRadius: config.headRadius || autoSize * 0.1,
      viewHeight: viewHeight,
      showLabels: config.showLabels ?? false,
      labelFontSize: config.labelFontSize || Math.max(10, autoSize * 0.015),
    };

    // 创建火柴人实例
    this.stickFigure = new StickFigure(layer, this.config);
    this.stickFigure.getGroup().addTo(layer);

    // 获取基础关键点
    this.baseKeypoints = this.stickFigure.getKeypoints();

    // 初始化关键点
    this.targetKeypoints = this.getPoseKeypoints(StickFigurePose.IDLE);
    this.currentKeypoints = this.cloneKeypoints(this.targetKeypoints);
    this.stickFigure.setKeypoints(this.currentKeypoints);
  }

  /**
   * 深拷贝关键点
   */
  private cloneKeypoints(
    keypoints: StickFigureKeypoints,
  ): StickFigureKeypoints {
    const result: any = {};
    Object.keys(keypoints).forEach((key) => {
      const k = key as keyof StickFigureKeypoints;
      result[k] = keypoints[k].clone();
    });
    return result as StickFigureKeypoints;
  }

  /**
   * 根据姿态获取关键点位置
   */
  private getPoseKeypoints(pose: StickFigurePose): StickFigureKeypoints {
    const base = this.baseKeypoints;
    const size = this.config.size;

    // 克隆基础关键点
    const keypoints = this.cloneKeypoints(base);

    switch (pose) {
      case StickFigurePose.IDLE:
        // 使用基础站立姿态
        return keypoints;

      case StickFigurePose.CROUCH:
        // 下蹲：降低身体高度，弯曲膝盖
        const crouchScale = 0.7; // 身体压缩比例
        const kneeBend = size * 0.15; // 膝盖弯曲距离

        // 降低髋部
        keypoints.hip.y += size * 0.1;
        keypoints.leftHip.y += size * 0.1;
        keypoints.rightHip.y += size * 0.1;

        // 弯曲膝盖（向前）
        keypoints.leftKnee.y = keypoints.leftHip.y + size * 0.15;
        keypoints.leftKnee.x = keypoints.leftHip.x - kneeBend * 0.3;
        keypoints.rightKnee.y = keypoints.rightHip.y + size * 0.15;
        keypoints.rightKnee.x = keypoints.rightHip.x + kneeBend * 0.3;

        // 降低脚踝
        keypoints.leftAnkle.y = keypoints.leftKnee.y + size * 0.12;
        keypoints.rightAnkle.y = keypoints.rightKnee.y + size * 0.12;

        // 稍微降低头部和颈部
        keypoints.neck.y += size * 0.05;
        keypoints.headTop.y += size * 0.05;
        keypoints.headLeft.y += size * 0.05;
        keypoints.headRight.y += size * 0.05;
        keypoints.headBottom.y += size * 0.05;

        return keypoints;

      case StickFigurePose.JUMP:
        // 跳跃：手臂向上，腿部向上收
        const jumpArmLift = size * 0.2;
        const jumpLegLift = size * 0.15;

        // 手臂向上
        keypoints.leftElbow.y -= jumpArmLift;
        keypoints.leftElbow.x -= size * 0.1;
        keypoints.leftWrist.y -= jumpArmLift * 1.2;
        keypoints.leftWrist.x -= size * 0.15;

        keypoints.rightElbow.y -= jumpArmLift;
        keypoints.rightElbow.x += size * 0.1;
        keypoints.rightWrist.y -= jumpArmLift * 1.2;
        keypoints.rightWrist.x += size * 0.15;

        // 腿部向上收
        keypoints.leftKnee.y -= jumpLegLift;
        keypoints.leftKnee.x -= size * 0.05;
        keypoints.leftAnkle.y -= jumpLegLift * 1.5;
        keypoints.leftAnkle.x -= size * 0.08;

        keypoints.rightKnee.y -= jumpLegLift;
        keypoints.rightKnee.x += size * 0.05;
        keypoints.rightAnkle.y -= jumpLegLift * 1.5;
        keypoints.rightAnkle.x += size * 0.08;

        return keypoints;

      case StickFigurePose.WALK_LEFT:
      case StickFigurePose.WALK_RIGHT:
        // 行走基础姿态（会在updateAnimation中动态调整）
        return keypoints;

      default:
        return keypoints;
    }
  }

  /**
   * 更新动画插值
   */
  private updateAnimation() {
    const isWalking =
      this.targetPose === StickFigurePose.WALK_LEFT ||
      this.targetPose === StickFigurePose.WALK_RIGHT;

    // 如果目标姿态改变，重置插值并更新目标关键点
    if (this.targetPose !== this.currentPose) {
      this.poseInterpolation = 0;
      // 获取基础姿态的关键点
      this.targetKeypoints = this.getPoseKeypoints(this.targetPose);
    }

    // 更新行走动画时间
    if (isWalking) {
      this.walkAnimationTime += 1;
    } else {
      this.walkAnimationTime = 0;
    }

    // 计算当前应该使用的目标关键点（考虑行走动画）
    let finalTargetKeypoints: StickFigureKeypoints;
    if (isWalking) {
      // 行走时，基于基础姿态添加动态摆动
      const baseKeypoints = this.getPoseKeypoints(this.targetPose);
      finalTargetKeypoints = this.cloneKeypoints(baseKeypoints);

      const walkCycle = Math.sin(this.walkAnimationTime * 0.025);
      const walkCycle2 = Math.sin(this.walkAnimationTime * 0.025 + Math.PI);
      const swingAmount = this.config.size * 0.15; // 摆动幅度

      // 左右手臂交替摆动
      finalTargetKeypoints.leftElbow.x += walkCycle * swingAmount * 0.5;
      finalTargetKeypoints.leftElbow.y +=
        Math.abs(walkCycle) * swingAmount * 0.3;
      finalTargetKeypoints.leftWrist.x += walkCycle * swingAmount;
      finalTargetKeypoints.leftWrist.y +=
        Math.abs(walkCycle) * swingAmount * 0.4;

      finalTargetKeypoints.rightElbow.x += walkCycle2 * swingAmount * 0.5;
      finalTargetKeypoints.rightElbow.y +=
        Math.abs(walkCycle2) * swingAmount * 0.3;
      finalTargetKeypoints.rightWrist.x += walkCycle2 * swingAmount;
      finalTargetKeypoints.rightWrist.y +=
        Math.abs(walkCycle2) * swingAmount * 0.4;

      // 左右腿部交替摆动
      finalTargetKeypoints.leftKnee.x += walkCycle * swingAmount * 0.4;
      finalTargetKeypoints.leftKnee.y +=
        Math.abs(walkCycle) * swingAmount * 0.2;
      finalTargetKeypoints.leftAnkle.x += walkCycle * swingAmount * 0.6;
      finalTargetKeypoints.leftAnkle.y +=
        Math.abs(walkCycle) * swingAmount * 0.3;

      finalTargetKeypoints.rightKnee.x += walkCycle2 * swingAmount * 0.4;
      finalTargetKeypoints.rightKnee.y +=
        Math.abs(walkCycle2) * swingAmount * 0.2;
      finalTargetKeypoints.rightAnkle.x += walkCycle2 * swingAmount * 0.6;
      finalTargetKeypoints.rightAnkle.y +=
        Math.abs(walkCycle2) * swingAmount * 0.3;
    } else {
      // 非行走状态，使用基础姿态的关键点
      finalTargetKeypoints = this.getPoseKeypoints(this.targetPose);
    }

    // 如果还没完全到达目标姿态，继续插值
    if (this.poseInterpolation < 1.0) {
      this.poseInterpolation = Math.min(
        1.0,
        this.poseInterpolation + this.animationSpeed,
      );

      // 使用缓动函数进行平滑插值
      const ease = (t: number) => t * (2 - t); // ease-out
      const t = ease(this.poseInterpolation);

      // 插值所有关键点坐标
      Object.keys(this.currentKeypoints).forEach((key) => {
        const k = key as keyof StickFigureKeypoints;
        const current = this.currentKeypoints[k];
        const target = finalTargetKeypoints[k];

        this.currentKeypoints[k] = new paper.Point(
          current.x + (target.x - current.x) * t,
          current.y + (target.y - current.y) * t,
        );
      });

      // 如果插值完成，更新当前姿态
      if (this.poseInterpolation >= 1.0) {
        this.currentPose = this.targetPose;
        this.currentKeypoints = this.cloneKeypoints(finalTargetKeypoints);
      }

      // 更新火柴人关键点
      this.stickFigure.setKeypoints(this.currentKeypoints);
    } else {
      // 插值完成，直接使用最终目标关键点
      this.currentKeypoints = this.cloneKeypoints(finalTargetKeypoints);
      this.stickFigure.setKeypoints(this.currentKeypoints);
    }
  }

  /**
   * 更新位置和状态
   */
  update(state: PlayerState) {
    // 根据状态确定目标姿态和面向方向
    let targetPose = StickFigurePose.IDLE;
    let newFacingRight = this.facingRight;

    if (state.isCrouching && state.isOnGround) {
      targetPose = StickFigurePose.CROUCH;
    } else if (state.isJumping) {
      targetPose = StickFigurePose.JUMP;
    } else if (state.velocityX < 0) {
      targetPose = StickFigurePose.WALK_LEFT;
      newFacingRight = false;
    } else if (state.velocityX > 0) {
      targetPose = StickFigurePose.WALK_RIGHT;
      newFacingRight = true;
    }

    // 更新目标姿态（如果改变）
    if (targetPose !== this.targetPose) {
      this.targetPose = targetPose;
    }

    // 更新面向方向
    if (newFacingRight !== this.facingRight) {
      this.facingRight = newFacingRight;
      // 翻转火柴人
      const group = this.stickFigure.getGroup();
      group.scaling = new paper.Point(this.facingRight ? 1 : -1, 1);
    }

    // 更新动画插值
    this.updateAnimation();

    // 更新位置（Y坐标是地面线，需要调整到中心）
    const group = this.stickFigure.getGroup();
    const bounds = group.bounds;
    const height = bounds.height;
    const centerY = state.y - height / 2;
    this.stickFigure.setPosition(state.x, centerY);
  }

  /**
   * 设置可见性
   */
  setVisible(visible: boolean) {
    this.stickFigure.setVisible(visible);
  }

  /**
   * 销毁
   */
  destroy() {
    this.stickFigure.destroy();
  }
}
