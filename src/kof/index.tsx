import cn from "classnames";
import paper from "paper";
import { useEffect, useRef } from "react";

import { drawXY, removeLayer } from "@/utils/paperjsWeapon";
import img_player from "@/assets/dude.png";
import img_stage from "@/assets/stage.png";

export default function KofComp() {
  const canvasRef = useRef(null) as any;
  let WIDTH = 0;
  let HEIGHT = 0;
  let tool = null as any;
  const initCanvas = () => {
    if (!canvasRef.current) return;
    canvasRef.current.style.cursor = "none";
    paper.setup(canvasRef.current);
    WIDTH = paper.project.view.bounds.width;
    HEIGHT = paper.project.view.bounds.height;
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
  const initPlayer = () => {
    removeLayer(paper.project, "layerRole");
    const layerXY = new paper.Layer();
    layerXY.name = "layerRole";
    const position = new paper.Point(WIDTH / 2, 0.75 * HEIGHT);
    const raster = new paper.Raster(img_player);
    raster.onLoad = () => {
      // 定义裁剪区域（x, y, width, height）
      // const clipRect = new paper.Rectangle(0, 0, 32, 48); // 替换为您想要裁剪的区域

      // 使用 clip 方法裁剪图片
      // raster.clipMask = new paper.Path.Rectangle(clipRect);
      raster.clipMask = true;
      raster.position = position;
      raster.strokeColor = new paper.Color("red");
      console.log("raster>>>", raster);
    };
    // raster.scale(3); // 将图片缩小到原来的50%
  };
  useEffect(() => {
    window.devicePixelRatio = 1;
    initCanvas();
    drawPic();
    initTool();
    initPlayer();
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
    </div>
  );
}
