import { Stage, Layer, Rect, Line, Text } from "react-konva";

const RIS = () => {
  let l = 20
  return <Stage width={800} height={500}>
    <Layer>
      {Array.from({ length: l }).map((_, i) =>
        <Line x={800 / l * i} y={0} points={[0, 0, 0, window.innerHeight]} stroke="#eef" strokeWidth={1} />
      )}
      {Array.from({ length: l }).map((_, i) =>
        <Line x={0} y={800 / l * i} points={[0, 0, window.innerWidth, 0]} stroke="#eef" strokeWidth={1} />
      )}
      {Array.from({ length: 10 }).map((_, i) => <><Rect
        width={50}
        height={180}
        stroke={"#999"}
        strokeWidth={1}
        fill={"#efefef"}
        opacity={0.5}
        x={70 * i} y={100 + ((i) * Math.sin(new Date().getTime() / 1000) * 10) % 20}
        key={i}
      >

      </Rect>
        <Line
          x={70 * i + 25}
          y={100 + ((i) * Math.sin(new Date().getTime() / 1000) * 10) % 20 + 180}
          points={[0, 0, 0, - 90 - ((i) * Math.sin(new Date().getTime() / 1000) * 10) % 20 + 180]}
          stroke="black"
          strokeWidth={1} />
        <Text
          x={70 * i}
          y={380}
          fontFamily={'isocpeur'}
          text={(((i) * Math.sin(new Date().getTime() / 1000) * 10) % 20).toLocaleString()} width={50} align="center" />
        <Line
          x={70 * i + 25}
          y={400}
          points={[0, 0, 0, 180]}
          stroke="black"
          strokeWidth={1} />
      </>)}

    </Layer>
  </Stage>
}

export default RIS
