import { useEffect, useRef, useState } from "react"
import { Monkey } from "../util/Monkey"
import { ConfigSubmitter, OptDataType } from "../util/types"
import Button from "./Button"

type OptimizeProps = {
  configuration: number[]
  submitConfiguration: ConfigSubmitter
  addOptData: (measurement: number) => void
  setCurrentMagnitude: (mag: number) => void
}

const Optimize: React.FC<OptimizeProps> = ({ configuration, submitConfiguration, addOptData, setCurrentMagnitude }) => {
  const monkey = useRef(new Monkey()) 
  const [mode, setMode] = useState<'max' | 'min' | 'none'>('none')

  const test = async (conf: number[]): Promise<number> => {
    const result = await submitConfiguration([...conf])
    console.log('Confirmed: ', result)
    addOptData(result)
    setCurrentMagnitude(result)
    return result
  }

  const startOpt = async (min: boolean) => {
    setMode(min ? 'min' : 'max')
    await monkey.current.optimize(configuration, min)
    setMode('none')
  }
  const stopOpt = () => {
    monkey.current.cancel()
    setMode('none')
  }

  useEffect(() => {
    monkey.current.setTestFunction(test)
  }, [monkey.current])  

  return <div>
    <h4 style={{ textAlign: "center" }}>Monkey Learning</h4>
    <div style={{ display: "flex"}}>
      <Button active={mode === 'min'} name="Minimize" onClick={() => startOpt(true)} />
      <Button active={mode === 'max'} name="Maximize" onClick={() => startOpt(false)} />
    </div>
    <p>{mode}</p>
    <Button name="Cancel" onClick={stopOpt}></Button>
  </div>
}

export default Optimize