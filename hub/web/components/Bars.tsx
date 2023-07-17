import { MouseEvent, useState } from "react";
import { ConfigSubmitter } from "../util/types";

type BarsProps = {
  configuration: number[]
  submitConfiguration: ConfigSubmitter
  submitConfigNoFeedback: (config: number[]) => void
  setCurrentMagnitude: (mag: number) => void
}

const Bars: React.FC<BarsProps> = ({ configuration, submitConfiguration, submitConfigNoFeedback, setCurrentMagnitude }) => {
  const [shadowPositions, setShadowPositions] = useState(Array.from({length: 10}).map(_=>({p: 0, show: false})))

  const onClick = async (e: MouseEvent<HTMLDivElement>, i: number) => {
    const r = e.currentTarget.getBoundingClientRect();
    let frac = (r.height - (e.clientY - r.top)) / r.height
    try {
        // submitConfigNoFeedback(configuration.map((p, j) => j == i ? frac/10 : p))
        setCurrentMagnitude(null)
        const result = await submitConfiguration(configuration.map((p, j) => j == i ? frac/10 : p))
        console.log("Result: ", result)
        setCurrentMagnitude(result)
        
    } catch(err) {
        console.log('Failed to submit conf: ', err) // More important to handle in optimize
    }
  }
  return <div style={{ display: 'flex', flexDirection: 'row', marginTop: 100 }}>
    {configuration.map((pos, i) => <div
    
    onClick={e => onClick(e, i)}
    onMouseMove={e => {
      const r = e.currentTarget.getBoundingClientRect();
      let frac = (r.height - (e.clientY - r.top)) / r.height
      setShadowPositions(positions => positions.map((p, j) => j == i ? ({show: true, p: frac/10}) : p))
    }}
    
    onMouseOut={e => {
      setShadowPositions(positions => positions.map((p, j) => j == i ? {p: p.p, show: false} : p))
    }}
    style={{ position: 'relative', height: 200, width: 40, display: 'flex', alignItems: 'flex-end', backgroundColor: 'rgb(250, 250, 250)', border: '1px dashed rgb(220, 220, 220)', borderRadius: 2, marginInline: 10 }} key={i}>
      <div style={{ zIndex: 1, background: 'linear-gradient(#e66465, #9198e5)', transition: 'height 0.1s', width: '100%', height: ((pos*10)*100) + '%', borderRadius: 2}} />

      <div style={{ zIndex: 0, position: 'absolute', opacity: shadowPositions[i].show == true ? 0.4 : 0.0, transition: 'opacity 0.1s', background: 'linear-gradient(#e66465ee, #9198e5ee)', width: '100%', height: ((shadowPositions[i].p*10)*100) + '%', borderRadius: 2}} />

    </div>)}
  </div>
}

export default Bars