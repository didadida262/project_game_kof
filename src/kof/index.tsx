import cn from "classnames";
import paper from "paper";
import { useEffect, useRef, useState } from "react";

import { drawXY } from "@/utils/paperjsWeapon";
import img_stage from "@/assets/stage.png";

export default function KofComp() {
  const canvasRef = useRef(null) as any;
  const [scoreData, setscoreData] = useState({
    name: "player1",
    score: 0,
  });
  let tool = null as any;
  const initCanvas = () => {
    if (!canvasRef.current) return;
    canvasRef.current.style.cursor = "none";
    paper.setup(canvasRef.current);
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
      console.log("down", e.point);
    };
    tool.onMouseDrag = (e: any) => {
      console.log("onMouseDrag", e.point);
    };
    tool.onMouseMove = (e: any) => {
      drawXY(paper.project, e.point);
      console.log("paper>>>", paper);
    };
    tool.onMouseUp = (e: any) => {
      console.log("onMouseUp", e.point);
    };
    tool.activate();
  };
  useEffect(() => {
    window.devicePixelRatio = 1;
    initCanvas();
    drawPic();
    initTool();
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
