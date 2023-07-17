import { useState } from "react"
import { NUM_ELMS } from "../constants"
import { ConfigSubmitter } from "../util/types"

type ManualProps = {
  submitConfiguration: ConfigSubmitter
}

const Manual: React.FC<ManualProps> = ({ submitConfiguration }) => {
  const [value, setValue] = useState(0)
  const [direction, setDirection] = useState(false)
  const [wavelength, setWavelength] = useState(0.062456762083333*2)

  const calculate = (dx: number) => {
    let pos = Array(NUM_ELMS).map((_, i)=>(dx*i)%(wavelength/2))
    if(direction) {
      pos.reverse()
    }
    pos = pos.map(p => 0.082-p)
    submitConfiguration(pos)
  }

  return <div
    style={{
      padding: 10, paddingInline: 20, margin: 8, backgroundColor: 'rgba(220, 220, 220, 0.4)',
      borderRadius: 8, WebkitBackdropFilter: 'blur(1px)', backdropFilter: 'blur(1px)',
      color: '#9d9696',
      verticalAlign: 'center',
      boxShadow: '#afa3a3 1px 1px 3px inset, inset rgb(255 255 255 / 96%) -1px -1px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
    <h4>Displacement</h4>
    {/*<span>Wavelength <input style={{border: '1px solid white', backgroundColor: 'rgb(244, 244, 244)', padding: 10, borderRadius: 8, marginBottom: 10}} value={wavelength} onChange={e=>setWavelength((e.target.value))}></input></span>*/}
    <input 
      style={{border: '1px solid white', backgroundColor: 'rgb(244, 244, 244)', padding: 10, borderRadius: 8, marginBottom: 10}} 
      value={value} onChange={e => setValue(Number(e.target.value))} 
    />
    <input type="checkbox" checked={direction} onChange={e=>setDirection(e.target.checked)}></input>
    <button onClick={()=>calculate(value)}>Activate</button>
  </div>
}

export default Manual