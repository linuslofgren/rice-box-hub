import { Dispatch, MouseEvent, SetStateAction, useState } from "react";
import UpDownBtn from "./UpDownBtn";
import styled from 'styled-components'
import { MAX_DISP } from '../constants'
import Arrow from "./Arrow";

const Container = styled.div`
  display: flex; flex-direction: column;
  :hover .hideable {
    visibility: visible;
  }
  .hideable {
    visibility: hidden;
  }
`

type BarsProps = {
  configuration: number[]
  submitConfiguration: (conf: number[]) => Promise<number> | void
  setCurrentMagnitude: (mag: number) => void
  currentMagnitude?: number
  measurementEnabled: boolean
  setMeasurementEnabled: Dispatch<SetStateAction<boolean>>
}

const Bars: React.FC<BarsProps> = ({ configuration, submitConfiguration, setCurrentMagnitude, currentMagnitude, measurementEnabled, setMeasurementEnabled }) => {
  const [shadowPositions, setShadowPositions] = useState(Array.from({ length: 10 }).map(_ => ({ p: 0, show: false })))
  const [facingFront, setFacingFront] = useState(false)

  const onSetPositions = async (conf: number[]) => {
    try {
      setCurrentMagnitude(null)
      await submitConfiguration(conf)
    } catch (err) {
      console.log('Failed to submit conf: ', err) // More important to handle in optimize
    }
  }
  const onClick = async (e: MouseEvent<HTMLDivElement>, i: number) => {
    let frac = fracHeight(e)
    if (facingFront) frac = 1 - frac
    onSetPositions(configuration.map((p, j) => j == i ? frac * MAX_DISP : p))
  }
  const onSetPosition = (disp: number, i: number) => {
    const copy = [...configuration]; copy[i] = disp;
    onSetPositions(copy)
  }
  const barStyle = () => {
    const style: any = {}
    facingFront ? style.top = 0 : style.bottom = 0
    return style
  }
  const onMouseMove = (e: MouseEvent<HTMLDivElement>, i: number) => {
    let frac = fracHeight(e)
    if (facingFront) frac = 1 - frac
    setShadowPositions(positions => positions.map((p, j) => j == i ? ({ show: true, p: frac * MAX_DISP }) : p))
  }
  return <Container>
    <div style={{ display: 'flex', flexDirection: facingFront ? 'row-reverse' : 'row', marginTop: 1 }}>
      {(configuration).map((pos, i) =>
        <div key={i}>
          <UpDownBtn onDown={() => onSetPosition(facingFront ? MAX_DISP : 0, i)} onUp={() => onSetPosition(facingFront ? 0 : MAX_DISP, i)} />
          <div
            onClick={e => onClick(e, i)}
            onMouseMove={e => onMouseMove(e, i)}

            onMouseOut={e => {
              setShadowPositions(positions => positions.map((p, j) => j == i ? { p: p.p, show: false } : p))
            }}
            style={{ position: 'relative', height: 200, width: 40, display: 'flex', alignItems: 'flex-end', backgroundColor: 'rgb(250, 250, 250)', border: '1px dashed rgb(220, 220, 220)', borderRadius: 2, marginInline: 10 }} key={i}
          >
            <div style={{ zIndex: 1, position: 'absolute', background: 'linear-gradient(#e66465, #9198e5)', transition: 'height 0.1s', width: '100%', height: ((pos / MAX_DISP) * 100) + '%',  ...barStyle(), borderRadius: 2 }} />

            <div style={{
              zIndex: 0, position: 'absolute', opacity: shadowPositions[i].show == true ? 0.4 : 0.0, transition: 'opacity 0.1s', background: 'linear-gradient(#e66465ee, #9198e5ee)', width: '100%',
              borderRadius: 2, height: ((shadowPositions[i].p / MAX_DISP) * 100).toString() + "%", ...barStyle()
            }}
            />
          </div>
        </div>)
      }
    </div>
    <div style={{ display: 'flex', alignItems: 'flex-start',justifyContent: 'space-between' }}>
      <div>
        <p>Throughput: {currentMagnitude ? `${currentMagnitude.toFixed(1)}dB` : '--'}</p>
        <div>
          <input id="toggle" type="checkbox" checked={measurementEnabled} onChange={e => setMeasurementEnabled(e.target.checked)} />
          <label htmlFor="toggle">Enable Measurement</label>
        </div>
      </div>
      <p onClick={() => setFacingFront(prev => !prev)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', paddingTop: 5 }}>
        <Arrow rotate={facingFront ? 180 : 0} /> 🍚
      </p>
    </div>
  </Container>
}

export default Bars

const fracHeight = (e: MouseEvent<HTMLDivElement>) => {
  const r = e.currentTarget.getBoundingClientRect()
  let frac = (r.height - (e.clientY - r.top)) / r.height
  return frac
}
