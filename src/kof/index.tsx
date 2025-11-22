import cn from "classnames";
import paper from "paper";
import { useEffect, useRef, useState } from "react";

import { ButtonCommon, EButtonType } from "@/components/ButtonCommon";
import { drawXY } from "@/utils/paperjsWeapon";
import fight from "@/assets/audio/three-two-one-fight-deep-voice.mp3";
import { Player } from "./Player";
import { GameWorld } from "./GameWorld";
import { PlayerRenderer } from "./PlayerRenderer";

export default function KofComp() {
  const [startFlag, setStartFlag] = useState(true);
  const canvasRef = useRef(null) as any;
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const animationFrameIdRef = useRef<number | null>(null);

  // 游戏引擎核心对象
  const gameWorldRef = useRef<GameWorld | null>(null);
  const player1Ref = useRef<Player | null>(null);
  const player1RendererRef = useRef<PlayerRenderer | null>(null);
  const playerLayerRef = useRef<paper.Layer | null>(null);

  let tool = null as any;

  /**
   * 创建曲折的地面线
   */
  const createWavyGroundLine = (width: number, groundY: number): paper.Path => {
    const segments: paper.Point[] = [];
    const waveAmplitude = 3; // 波浪幅度（加大曲折幅度）
    const waveFrequency = 0.02; // 波浪频率（越小波浪越多）
    const segmentCount = 100; // 分段数量，越多越平滑

    for (let i = 0; i <= segmentCount; i++) {
      const x = (width / segmentCount) * i;
      // 使用正弦波创建曲折效果，添加一些随机性
      const baseY = groundY;
      const wave = Math.sin(x * waveFrequency) * waveAmplitude;
      const randomOffset = (Math.random() - 0.5) * 1.5; // 增加随机偏移
      const y = baseY + wave + randomOffset;
      segments.push(new paper.Point(x, y));
    }

    const path = new paper.Path({
      segments: segments,
      strokeColor: "#FFFFFF", // 白色
      strokeWidth: 2,
      strokeCap: "round",
      strokeJoin: "round",
    });

    return path;
  };

  /**
   * 初始化画布和游戏世界
   */
  const initCanvas = () => {
    if (!canvasRef.current) return;
    canvasRef.current.style.cursor = "none";
    paper.setup(canvasRef.current);

    // 创建游戏世界，设置地面线为700
    const view = paper.view;
    const bounds = view.bounds;
    gameWorldRef.current = new GameWorld(view, {
      groundY: 700, // 地面线基准
      viewWidth: bounds.width,
      viewHeight: bounds.height,
    });

    // 创建背景层（纯黑背景）
    const bgLayer = new paper.Layer();
    bgLayer.name = "background";
    const bgRect = new paper.Path.Rectangle({
      rectangle: view.bounds,
      fillColor: "#000000", // 纯黑色
    });
    bgLayer.addChild(bgRect);

    // 创建地面层（曲折的白线）
    const groundLayer = new paper.Layer();
    groundLayer.name = "ground";
    const groundY = gameWorldRef.current.getGroundY();
    const groundPath = createWavyGroundLine(bounds.width, groundY);
    groundLayer.addChild(groundPath);

    // 创建人物层
    playerLayerRef.current = new paper.Layer();
    playerLayerRef.current.name = "players";
  };

  // 键盘按下事件
  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    keysRef.current[key] = true;

    // 玩家1控制 (WASD)
    if (player1Ref.current) {
      if (key === "w") {
        player1Ref.current.jump();
      } else if (key === "s") {
        player1Ref.current.startCrouch();
      } else if (key === "a") {
        player1Ref.current.moveLeft();
      } else if (key === "d") {
        player1Ref.current.moveRight();
      }
    }
  };

  // 键盘释放事件
  const handleKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    keysRef.current[key] = false;

    // 玩家1控制
    if (player1Ref.current) {
      if (key === "s") {
        player1Ref.current.stopCrouch();
      } else if (key === "a" || key === "d") {
        player1Ref.current.stopHorizontalMovement();
      }
    }
  };

  // 游戏循环
  const gameLoop = () => {
    if (!startFlag) return;

    // 更新玩家1
    if (player1Ref.current && player1RendererRef.current) {
      player1Ref.current.update();
      const state = player1Ref.current.getState();
      player1RendererRef.current.update(state);
    }

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);
  };

  const initTool = () => {
    tool = new paper.Tool();
    tool.onMouseDown = (e: any) => {
      // console.log("down", e.point);
    };
    tool.onMouseDrag = (e: any) => {
      // console.log("onMouseDrag", e.point);
    };
    tool.onMouseMove = (e: any) => {
      drawXY(paper.project, e.point);
      // console.log("paper>>>", paper);
    };
    tool.onMouseUp = (e: any) => {
      // console.log("onMouseUp", e.point);
    };
    tool.activate();
  };
  // const initPlayer = () => {
  //   removeLayer(paper.project, "layerRole");
  //   const layerXY = new paper.Layer();
  //   layerXY.name = "layerRole";
  //   const position = new paper.Point(WIDTH / 2, 0.75 * HEIGHT);
  //   const raster = new paper.Raster(img_role1);
  //   raster.onLoad = () => {
  //     // 定义裁剪区域（x, y, width, height）
  //     // const clipRect = new paper.Rectangle(0, 0, 32, 48); // 替换为您想要裁剪的区域

  //     // 使用 clip 方法裁剪图片
  //     // raster.clipMask = new paper.Path.Rectangle(clipRect);
  //     raster.clipMask = true;
  //     raster.position = position;
  //     raster.strokeColor = new paper.Color("red");
  //     console.log("raster>>>", raster);
  //   };
  //   // raster.scale(3); // 将图片缩小到原来的50%
  // };
  const initGame = () => {
    const audio = new Audio(fight); // 音效文件路径
    audio.play();
    setTimeout(() => {
      setStartFlag(true);
    }, 4000);
  };

  // 初始化键盘监听
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  // 初始化画布
  useEffect(() => {
    window.devicePixelRatio = 1;
    initCanvas();
    initTool();
  }, []);

  // 初始化玩家
  useEffect(() => {
    if (!startFlag || !gameWorldRef.current || !playerLayerRef.current) return;

    // 延迟一下确保Paper.js已初始化
    const timer = setTimeout(() => {
      const gameWorld = gameWorldRef.current!;
      const playerLayer = playerLayerRef.current!;
      const bounds = gameWorld.getBounds();

      // 创建玩家1（左侧25%位置）
      const initialX = bounds.width * 0.25;
      if (!player1Ref.current) {
        player1Ref.current = new Player(gameWorld, initialX);
        player1RendererRef.current = new PlayerRenderer(
          player1Ref.current,
          playerLayer,
          {
            // size会根据viewHeight自动计算（约为视图高度的28%）
            color: "#000000", // 纯黑色
            viewHeight: bounds.height,
            strokeWidth: Math.max(4, bounds.height * 0.005), // 线条稍微细一点，更经典
            headRadius: bounds.height * 0.025, // 头部稍微小一点
            showLabels: true, // 显示关键点标注
            labelFontSize: Math.max(10, bounds.height * 0.015), // 标注字体大小
          },
        );
      } else {
        player1Ref.current.resetPosition(initialX);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [startFlag]);

  // 启动游戏循环
  useEffect(() => {
    if (startFlag) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      gameLoop();
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [startFlag]);
  return (
    <div
      className={cn(
        "relative w-full h-full",
        "flex justify-center",
        "bg-black",
      )}
    >
      <canvas ref={canvasRef} className="w-full h-full markBorderC" />

      {startFlag && (
        <div
          className={cn(
            "absolute top-4 left-4 text-white text-sm",
            "bg-black bg-opacity-50 p-2 rounded z-10",
          )}
        >
          <div>控制说明：</div>
          <div>W - 跳跃</div>
          <div>A - 向左移动</div>
          <div>S - 下蹲</div>
          <div>D - 向右移动</div>
        </div>
      )}

      {!startFlag && (
        <div
          className={cn(
            "absolute left-0 bottom-0 w-full h-full",
            "flex items-center justify-center",
          )}
        >
          <ButtonCommon
            type={EButtonType.GHOST}
            className="text-[#FFFFFF]"
            onClick={() => {
              initGame();
            }}
          >
            <span className="ml-[8px]">Start Game</span>
          </ButtonCommon>
        </div>
      )}
    </div>
  );
}
