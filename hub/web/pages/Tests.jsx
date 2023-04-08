import { Layer, Rect, Stage } from "react-konva";

function Tests(props) {
  const f = 2;
  return (
    <Stage width={1000} height={1000}>
      <Layer>
        <Rect
          x={props.x * f + 200}
          y={props.y * f + 200}
          width={20}
          height={20}
          fill={"brown"}
          shadowBlur={1}
        />
        <Rect
          x={props.tx * f + 200}
          y={props.ty * f + 200}
          width={20}
          height={20}
          fill={"blue"}
          shadowBlur={1}
        />
        <Rect
          x={props.rx * f + 200}
          y={props.ry * f + 200}
          width={20}
          height={20}
          fill={"#fafafa"}
          shadowBlur={1}
        />
      </Layer>
    </Stage>
  );
}

export default Tests;
