import { useEffect, useRef, useState } from "react"
import { Monkey } from "../util/Monkey"
import { ConfigSubmitter } from "../util/types"
import Button from "./Button"

type OptimizeProps = {
  configuration: number[]
  submitConfiguration: ConfigSubmitter
  addOptData: (measurement: number) => void
}

const Optimize: React.FC<OptimizeProps> = ({ configuration, submitConfiguration, addOptData }) => {
  const monkey = useRef(new Monkey()) 
  const [mode, setMode] = useState<'max' | 'min' | 'none'>('none')
  const [numIterations, setNumIterations] = useState("2")

  const test = async (conf: number[]): Promise<number> => {
    const result = (await submitConfiguration([...conf]))
    console.log('Confirmed: ', result)
    addOptData(result)
    return result
  }

  const startOpt = async (min: boolean) => {
    if(!numIterations) return
    setMode(min ? 'min' : 'max')
    await monkey.current.optimize(configuration, parseInt(numIterations), min)
    setMode('none')
  }
  const stopOpt = () => {
    monkey.current.cancel()
    setMode('none')
  }

  useEffect(() => {
    monkey.current.setTestFunction(test)
  }, [monkey.current])  

  return <div style={{ marginTop: 20, display:'flex', alignItems: 'center', flexDirection: "column"}}>
    <h4 style={{ textAlign: "center" }}>Monkey Learning 🐒</h4>
    <div style={{ display: "flex"}}>
      <Button rainbow={mode === 'min'} name="Minimize"  onClick={() => startOpt(true)} />
      <Button rainbow={mode === 'max'} name="Maximize" onClick={() => startOpt(false)} />
      <Button name="Cancel" onClick={stopOpt}></Button>
    </div>
    <div style={{ paddingBottom: 15}}>
      <p>Number of iterations</p>
      <input type="number" value={numIterations} onChange={e => setNumIterations(e.target.value)}/>
    </div>
  </div>
}

export default Optimize