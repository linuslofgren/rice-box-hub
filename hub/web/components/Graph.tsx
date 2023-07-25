import { CartesianGrid, Label, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { OptDataType } from "../util/types";
import Arrow from "./Arrow";

type GraphProps = { 
  data: OptDataType[], 
  style?: any, 
  graphHeight: number, 
  sideBySide: boolean
  onSideBySide: () => void
}

const Graph: React.FC<GraphProps> = ({ data, style, graphHeight, sideBySide, onSideBySide }) => {
  console.log(data)

  return <div style={{ width: '100%', padding: 40, boxSizing: 'border-box', maxWidth: 1500, backgroundColor: 'white' , ...style}}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <h3 style={{ marginLeft: 60, marginBottom: 40, marginTop: 0 }}>Optimization Progress</h3>
      <div>
        <Arrow rotate={sideBySide ? 270 : 90} onClick={onSideBySide} />
      </div>
    </div>
    <ResponsiveContainer minWidth={400} minHeight={100} height={graphHeight}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey='index'>
        <Label value='Configuration number' position='insideBottom' offset={-5} />
      </XAxis>
      <YAxis dataKey='magnitude'>
        <Label value='Magnitude (dB)' angle={-90} position='left' offset={-1} />
      </YAxis>
      <Tooltip />
      {/* <Legend /> */}
      <Line animationDuration={100} type="linear" dataKey="magnitude" stroke="#8884d8" activeDot={{ r: 8 }} />
    </LineChart>
  </ResponsiveContainer> 
  </div>
}
const DATA = [
  // {
  //     "index": 0,
  //     "magnitude": -44.2245
  // },
  {
      "index": 1,
      "magnitude": -44.3348
  },
  {
      "index": 2,
      "magnitude": -44.3901
  },
  {
      "index": 3,
      "magnitude": -44.3032
  },
  {
      "index": 4,
      "magnitude": -44.2239
  },
  {
      "index": 5,
      "magnitude": -44.3264
  },
  {
      "index": 6,
      "magnitude": -44.2601
  },
  {
      "index": 7,
      "magnitude": -44.0628
  },
  {
      "index": 8,
      "magnitude": -44.166
  },
  {
      "index": 9,
      "magnitude": -44.2297
  },
  {
      "index": 10,
      "magnitude": -44.2191
  },
  {
      "index": 11,
      "magnitude": -44.2755
  },
  {
      "index": 12,
      "magnitude": -44.2203
  },
  {
      "index": 13,
      "magnitude": -44.2041
  },
  {
      "index": 14,
      "magnitude": -44.2558
  },
  {
      "index": 15,
      "magnitude": -44.2701
  },
  {
      "index": 16,
      "magnitude": -44.2383
  },
  {
      "index": 17,
      "magnitude": -44.241
  },
  {
      "index": 18,
      "magnitude": -44.2273
  },
  {
      "index": 19,
      "magnitude": -44.2141
  },
  {
      "index": 20,
      "magnitude": -44.2394
  },
  {
      "index": 21,
      "magnitude": -44.396
  },
  {
      "index": 22,
      "magnitude": -44.344
  },
  {
      "index": 23,
      "magnitude": -44.3491
  },
  {
      "index": 24,
      "magnitude": -44.3912
  }
]
export default Graph
