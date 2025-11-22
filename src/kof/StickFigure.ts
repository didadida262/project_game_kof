import paper from "paper";

/**
 * 18关键点骨架模型
 * 参考标准姿态估计模型（如OpenPose）
 */
export interface StickFigureKeypoints {
  // 0: 颈部/脊柱顶部
  neck: paper.Point;
  // 1: 髋部/脊柱底部
  hip: paper.Point;
  // 2: 左肩
  leftShoulder: paper.Point;
  // 3: 左肘
  leftElbow: paper.Point;
  // 4: 左腕
  leftWrist: paper.Point;
  // 5: 右肩
  rightShoulder: paper.Point;
  // 6: 右肘
  rightElbow: paper.Point;
  // 7: 右腕
  rightWrist: paper.Point;
  // 8: 左髋
  leftHip: paper.Point;
  // 9: 左膝
  leftKnee: paper.Point;
  // 10: 左踝
  leftAnkle: paper.Point;
  // 11: 右髋
  rightHip: paper.Point;
  // 12: 右膝
  rightKnee: paper.Point;
  // 13: 右踝
  rightAnkle: paper.Point;
  // 14, 15, 16, 17: 头部关键点
  headTop: paper.Point; // 14: 头部顶部
  headRight: paper.Point; // 15: 头部右侧
  headLeft: paper.Point; // 16: 头部左侧
  headBottom: paper.Point; // 17: 头部底部
}

/**
 * 火柴人配置
 */
export interface StickFigureConfig {
  size?: number; // 火柴人大小（高度）
  color?: string; // 颜色
  strokeWidth?: number; // 线条宽度
  headRadius?: number; // 头部半径
  viewHeight?: number; // 视图高度
  showLabels?: boolean; // 是否显示关键点标注
  labelFontSize?: number; // 标注字体大小
}

/**
 * 关键点连接关系
 * 定义哪些关键点之间需要连线
 */
interface KeypointConnection {
  from: keyof StickFigureKeypoints;
  to: keyof StickFigureKeypoints;
  color?: string; // 可选的颜色，用于区分不同部位
}

/**
 * 火柴人类
 * 使用18关键点骨架模型
 */
export class StickFigure {
  private group: paper.Group;
  private config: Required<StickFigureConfig>;

  // 所有关键点之间的连接线段
  private connections: Map<string, paper.Path.Line> = new Map();

  // 关键点标注组（包含背景和文本）
  private labels: Map<keyof StickFigureKeypoints, paper.Group> = new Map();

  // 关键点名称映射（编号和名称）
  private readonly keypointNames: Record<
    keyof StickFigureKeypoints,
    { index: number; name: string }
  > = {
    neck: { index: 0, name: "颈部" },
    hip: { index: 1, name: "髋部" },
    leftShoulder: { index: 2, name: "左肩" },
    leftElbow: { index: 3, name: "左肘" },
    leftWrist: { index: 4, name: "左腕" },
    rightShoulder: { index: 5, name: "右肩" },
    rightElbow: { index: 6, name: "右肘" },
    rightWrist: { index: 7, name: "右腕" },
    leftHip: { index: 8, name: "左髋" },
    leftKnee: { index: 9, name: "左膝" },
    leftAnkle: { index: 10, name: "左踝" },
    rightHip: { index: 11, name: "右髋" },
    rightKnee: { index: 12, name: "右膝" },
    rightAnkle: { index: 13, name: "右踝" },
    headTop: { index: 14, name: "头顶" },
    headRight: { index: 15, name: "头右" },
    headLeft: { index: 16, name: "头左" },
    headBottom: { index: 17, name: "下巴" },
  };

  // 关键点连接定义（根据18点骨架模型）
  private readonly keypointConnections: KeypointConnection[] = [
    // 头部连接结构
    { from: "neck", to: "headTop", color: "#0000FF" }, // 0-14: 蓝色
    { from: "headTop", to: "headLeft", color: "#FF00FF" }, // 14-16: 紫色
    { from: "headTop", to: "headRight", color: "#FF00FF" }, // 14-15: 粉色
    { from: "headLeft", to: "headBottom", color: "#FF00FF" }, // 16-17: 粉色
    { from: "headRight", to: "headBottom", color: "#FF00FF" }, // 15-17: 粉色
    { from: "neck", to: "headBottom", color: "#FF00FF" }, // 0-17: 粉色

    // 躯干连接
    { from: "neck", to: "hip", color: "#00FF00" }, // 0-1: 绿色

    // 肩膀到躯干连接
    { from: "neck", to: "leftShoulder", color: "#FF0000" }, // 0-2: 红色
    { from: "neck", to: "rightShoulder", color: "#FF0000" }, // 0-5: 红色
    { from: "leftShoulder", to: "hip", color: "#FF8000" }, // 2-1: 橙色
    { from: "rightShoulder", to: "hip", color: "#FF8000" }, // 5-1: 橙色

    // 左臂连接
    { from: "leftShoulder", to: "leftElbow", color: "#FFA500" }, // 2-3: 橙色
    { from: "leftElbow", to: "leftWrist", color: "#ADFF2F" }, // 3-4: 黄绿色

    // 右臂连接
    { from: "rightShoulder", to: "rightElbow", color: "#90EE90" }, // 5-6: 浅绿色
    { from: "rightElbow", to: "rightWrist", color: "#00FF00" }, // 6-7: 绿色

    // 髋部到躯干连接
    { from: "hip", to: "leftHip", color: "#00FF00" }, // 1-8: 绿色
    { from: "hip", to: "rightHip", color: "#00FFFF" }, // 1-11: 青色

    // 左腿连接（青色/蓝绿色）
    { from: "leftHip", to: "leftKnee", color: "#00CED1" }, // 8-9: 青色/蓝绿色
    { from: "leftKnee", to: "leftAnkle", color: "#008B8B" }, // 9-10: 深青色/蓝绿色

    // 右腿连接
    { from: "rightHip", to: "rightKnee", color: "#0000FF" }, // 11-12: 蓝色
    { from: "rightKnee", to: "rightAnkle", color: "#4B0082" }, // 12-13: 深蓝紫色
  ];

  // 当前关键点位置
  private keypoints: StickFigureKeypoints;

  constructor(layer: paper.Layer, config: StickFigureConfig = {}) {
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

    // 创建组
    this.group = new paper.Group();
    this.group.name = "stickFigure";

    // 初始化关键点（默认站立姿态）
    this.keypoints = this.getDefaultKeypoints();

    // 创建所有连接线段
    this.createConnections();

    // 更新所有连接线段位置
    this.updateConnections();

    // 创建关键点标注
    if (this.config.showLabels) {
      this.createLabels();
    }
  }

  /**
   * 获取默认关键点位置（站立姿态）
   * 根据图片中的姿态调整角度和分布
   */
  private getDefaultKeypoints(): StickFigureKeypoints {
    const size = this.config.size;
    const headRadius = this.config.headRadius;

    // 中心点在(0, 0)，Y轴向下为正
    // 头部在顶部（Y为负），身体向下延伸（Y为正）

    // 0: 颈部（头部下方，作为躯干顶部）
    const neckY = -size / 2 + headRadius * 2.2;
    const neck = new paper.Point(0, neckY);

    // 1: 髋部（身体底部，在中心点下方）
    const bodyLength = size * 0.4; // 身体长度
    const hipY = neckY + bodyLength;
    const hip = new paper.Point(0, hipY);

    // 2: 左肩（与髋部1基本在一条直线上，只是稍微向外张开一点）
    // 肩膀应该在髋部上方，与髋部形成接近垂直的线
    const shoulderY = hipY - bodyLength * 0.9; // 肩膀在髋部上方，接近颈部
    const shoulderWidth = size * 0.08; // 减小肩膀宽度，使幅度更小
    const leftShoulder = new paper.Point(-shoulderWidth, shoulderY);

    // 5: 右肩
    const rightShoulder = new paper.Point(shoulderWidth, shoulderY);

    // 左臂：自然下垂，稍微向外张开
    const upperArmLength = size * 0.2;
    const leftArmAngle = Math.PI * 0.55; // 约99度，稍微向外
    const leftElbow = new paper.Point(
      leftShoulder.x + Math.cos(leftArmAngle) * upperArmLength,
      leftShoulder.y + Math.sin(leftArmAngle) * upperArmLength,
    );

    // 右臂：自然下垂，稍微向外张开
    const rightArmAngle = Math.PI * 0.45; // 约81度，稍微向外
    const rightElbow = new paper.Point(
      rightShoulder.x + Math.cos(rightArmAngle) * upperArmLength,
      rightShoulder.y + Math.sin(rightArmAngle) * upperArmLength,
    );

    // 4: 左腕（前臂稍微向前）
    const forearmLength = size * 0.18;
    const leftForearmAngle = leftArmAngle + Math.PI * 0.05; // 稍微向前
    const leftWrist = new paper.Point(
      leftElbow.x + Math.cos(leftForearmAngle) * forearmLength,
      leftElbow.y + Math.sin(leftForearmAngle) * forearmLength,
    );

    // 7: 右腕
    const rightForearmAngle = rightArmAngle - Math.PI * 0.05; // 稍微向前
    const rightWrist = new paper.Point(
      rightElbow.x + Math.cos(rightForearmAngle) * forearmLength,
      rightElbow.y + Math.sin(rightForearmAngle) * forearmLength,
    );

    // 8: 左髋（从髋部中心向左下方延伸，形成明显的斜线）
    const hipDistance = size * 0.13; // 髋部到左右髋的距离
    const hipAngle = Math.PI * 0.35; // 约63度，向左下方倾斜
    const leftHip = new paper.Point(
      -Math.cos(hipAngle) * hipDistance,
      hipY + Math.sin(hipAngle) * hipDistance,
    );

    // 11: 右髋（从髋部中心向右下方延伸，形成明显的斜线）
    const rightHip = new paper.Point(
      Math.cos(hipAngle) * hipDistance,
      hipY + Math.sin(hipAngle) * hipDistance,
    );

    // 左腿：稍微向外张开
    const thighLength = size * 0.24;
    const leftThighAngle = Math.PI * 0.52; // 约93.6度，稍微向外
    const leftKnee = new paper.Point(
      leftHip.x + Math.cos(leftThighAngle) * thighLength,
      leftHip.y + Math.sin(leftThighAngle) * thighLength,
    );

    // 右腿：稍微向外张开
    const rightThighAngle = Math.PI * 0.48; // 约86.4度，稍微向外
    const rightKnee = new paper.Point(
      rightHip.x + Math.cos(rightThighAngle) * thighLength,
      rightHip.y + Math.sin(rightThighAngle) * thighLength,
    );

    // 10: 左踝（小腿稍微向前）
    const shinLength = size * 0.24;
    const leftShinAngle = leftThighAngle + Math.PI * 0.02; // 稍微向前
    const leftAnkle = new paper.Point(
      leftKnee.x + Math.cos(leftShinAngle) * shinLength,
      leftKnee.y + Math.sin(leftShinAngle) * shinLength,
    );

    // 13: 右踝
    const rightShinAngle = rightThighAngle - Math.PI * 0.02; // 稍微向前
    const rightAnkle = new paper.Point(
      rightKnee.x + Math.cos(rightShinAngle) * shinLength,
      rightKnee.y + Math.sin(rightShinAngle) * shinLength,
    );

    // 14-17: 头部关键点（形成头部轮廓）
    const headCenterY = -size / 2 + headRadius;
    // 14: 头部顶部
    const headTop = new paper.Point(0, headCenterY - headRadius * 0.9);
    // 15: 头部右侧（耳朵位置）
    const headRight = new paper.Point(
      headRadius * 0.75,
      headCenterY - headRadius * 0.15,
    );
    // 16: 头部左侧（耳朵位置）
    const headLeft = new paper.Point(
      -headRadius * 0.75,
      headCenterY - headRadius * 0.15,
    );
    // 17: 头部底部（下巴）
    const headBottom = new paper.Point(0, headCenterY + headRadius * 0.6);

    return {
      neck,
      hip,
      leftShoulder,
      leftElbow,
      leftWrist,
      rightShoulder,
      rightElbow,
      rightWrist,
      leftHip,
      leftKnee,
      leftAnkle,
      rightHip,
      rightKnee,
      rightAnkle,
      headTop,
      headLeft,
      headRight,
      headBottom,
    };
  }

  /**
   * 创建所有关键点之间的连接线段
   */
  private createConnections() {
    this.keypointConnections.forEach((connection) => {
      const key = `${connection.from}-${connection.to}`;
      const fromPoint = this.keypoints[connection.from];
      const toPoint = this.keypoints[connection.to];

      const line = new paper.Path.Line({
        from: fromPoint,
        to: toPoint,
        strokeColor: connection.color || this.config.color,
        strokeWidth: this.config.strokeWidth,
        strokeCap: "round",
      });

      this.connections.set(key, line);
      this.group.addChild(line);
    });
  }

  /**
   * 更新所有连接线段的位置
   */
  private updateConnections() {
    this.keypointConnections.forEach((connection) => {
      const key = `${connection.from}-${connection.to}`;
      const line = this.connections.get(key);

      if (line) {
        const fromPoint = this.keypoints[connection.from];
        const toPoint = this.keypoints[connection.to];

        line.segments[0].point = fromPoint;
        line.segments[1].point = toPoint;
      }
    });

    // 更新标注位置
    if (this.config.showLabels) {
      this.updateLabels();
    }
  }

  /**
   * 创建关键点标注
   */
  private createLabels() {
    Object.keys(this.keypoints).forEach((key) => {
      const k = key as keyof StickFigureKeypoints;
      const point = this.keypoints[k];
      const info = this.keypointNames[k];

      // 创建标注文本（只显示编号）
      const labelText = `${info.index}`;
      const label = new paper.PointText({
        point: new paper.Point(
          point.x,
          point.y - this.config.labelFontSize * 1.5,
        ),
        content: labelText,
        fillColor: "#FFFFFF",
        fontSize: this.config.labelFontSize,
        justification: "center",
        fontFamily: "Arial, sans-serif",
      });

      // 添加背景矩形以提高可读性
      const bounds = label.bounds;
      const padding = this.config.labelFontSize * 0.3;
      const background = new paper.Path.Rectangle({
        rectangle: new paper.Rectangle(
          bounds.x - padding,
          bounds.y - padding,
          bounds.width + padding * 2,
          bounds.height + padding * 2,
        ),
        fillColor: new paper.Color(0, 0, 0, 0.7),
        strokeColor: "#FFFFFF",
        strokeWidth: 1,
      });

      // 将背景和文本组合
      const labelGroup = new paper.Group([background, label]);
      labelGroup.name = `label-${k}`;

      this.labels.set(k, labelGroup);
      this.group.addChild(labelGroup);
    });
  }

  /**
   * 更新关键点标注位置
   */
  private updateLabels() {
    this.labels.forEach((labelGroup, key) => {
      const point = this.keypoints[key];
      // 标注位置在关键点上方
      const text = labelGroup.children[1] as paper.PointText;
      if (text) {
        text.point = new paper.Point(
          point.x,
          point.y - this.config.labelFontSize * 1.5,
        );
        // 更新背景位置
        const bounds = text.bounds;
        const padding = this.config.labelFontSize * 0.3;
        const background = labelGroup.children[0] as paper.Path.Rectangle;
        if (background) {
          background.bounds = new paper.Rectangle(
            bounds.x - padding,
            bounds.y - padding,
            bounds.width + padding * 2,
            bounds.height + padding * 2,
          );
        }
      }
    });
  }

  /**
   * 更新关键点位置
   */
  setKeypoints(keypoints: Partial<StickFigureKeypoints>) {
    // 更新关键点
    Object.keys(keypoints).forEach((key) => {
      const k = key as keyof StickFigureKeypoints;
      if (keypoints[k]) {
        this.keypoints[k] = keypoints[k]!;
      }
    });

    // 更新所有连接线段
    this.updateConnections();
  }

  /**
   * 获取当前关键点位置
   */
  getKeypoints(): StickFigureKeypoints {
    // 返回关键点的深拷贝
    const result: any = {};
    Object.keys(this.keypoints).forEach((key) => {
      const k = key as keyof StickFigureKeypoints;
      result[k] = this.keypoints[k].clone();
    });
    return result as StickFigureKeypoints;
  }

  /**
   * 设置位置
   */
  setPosition(x: number, y: number) {
    this.group.position = new paper.Point(x, y);
  }

  /**
   * 设置可见性
   */
  setVisible(visible: boolean) {
    this.group.visible = visible;
  }

  /**
   * 获取组（用于添加到图层）
   */
  getGroup(): paper.Group {
    return this.group;
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.group) {
      this.group.remove();
    }
  }
}
