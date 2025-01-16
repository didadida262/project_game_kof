import cn from "classnames";
import paper from "paper";
import { useEffect, useRef, useState } from "react";

import { ButtonCommon, EButtonType } from "@/components/ButtonCommon";
import { drawXY } from "@/utils/paperjsWeapon";
import Benimarukofxii from "@/assets/Benimarukofxii.gif";
import fight from "@/assets/audio/three-two-one-fight-deep-voice.mp3";
import img_stage from "@/assets/stage.png";
// import img_player from "@/assets/dude.png";
import Shenwookofxii from "@/assets/Shenwookofxii.gif";

export default function KofComp() {
  const [startFlag, setStartFlag] = useState(false);
  const canvasRef = useRef(null) as any;
  // let WIDTH = 0;
  // let HEIGHT = 0;
  let tool = null as any;
  const initCanvas = () => {
    if (!canvasRef.current) return;
    canvasRef.current.style.cursor = "none";
    paper.setup(canvasRef.current);
    // WIDTH = paper.project.view.bounds.width;
    // HEIGHT = paper.project.view.bounds.height;
  };
  const drawPic = () => {
    const raster = new paper.Raster(img_stage);
    raster.onLoad = () => {
      raster.fitBounds(paper.view.bounds, false);
    };
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
    // 定义火柴人的移动速度
    tool.onKeyDown = (e: any) => {
      switch (e.key) {
        case "left":
          // 向左移动

          break;
        case "right":
          // 向右移动
          break;
        case "up":
          // 面对屏幕（可以添加一些动画或变化）
          // 这里可以添加代码来改变火柴人的姿势或状态
          break;
      }
    };
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
  useEffect(() => {
    window.devicePixelRatio = 1;
    initCanvas();
    drawPic();
    initTool();
    // initPlayer();
  }, []);
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
            "absolute left-0 bottom-0 w-full h-[calc(50%)]",
            "flex items-center justify-around",
          )}
        >
          <div className={cn("scale-125")}>
            <img src={Benimarukofxii}></img>
          </div>

          <div className={cn("rotate-y-180")}>
            <img src={Shenwookofxii} style={{ transform: "scale(1.25)" }}></img>
          </div>
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
