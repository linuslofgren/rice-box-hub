import { useEffect, useRef, useState } from "react";
import Bars from "../components/Bars";
import Button from "../components/Button";
import Manual from "../components/Manual";
import Optimize from "../components/Optimize";
import { NUM_ELMS } from "../constants";
import { v4 as uuid } from 'uuid'
import { AckDataType, ConfigSubmitter, OperationMode, OptDataType, Position, Setter } from "../util/types";
import { Waiter } from "../util/Waiter";
import Graph from "../components/Graph";

const Page = () => {
  const [operation, setOperation] = useState<OperationMode>("optimize");
  const [risPosition, setRisPosition] = useState<Position>();
  const [txPosition, setTxPosition] = useState<Position>();
  const [rxPosition, setRxPosition] = useState<Position>();
  const [positions, setPositions] = useState<number[]>(Array(NUM_ELMS).fill(0))
  const [magnitude, setMagnitude] = useState<number | null>(null)
  const [measurementEnabled, setMeasurementEnabled] = useState(true)
  const [realtimeMags, setRealtimeMags] = useState<OptDataType[]>([])
  const [optData, setOptData] = useState<OptDataType[]>([])
  const [sideBySide, setSideBySide] = useState(false)
  const [realtimeOn, setRealtimeOn] = useState(false)
  const waiter = useRef(new Waiter<AckDataType>())
  const ws = useRef<WebSocket>();
  const canvas = useRef<HTMLCanvasElement>()

  const handlePosUpdate = (data: any, setTxPos: Setter, setRxPos: Setter, setRisPos: Setter) => {
    if(data.object === 'tx') {
      setTxPos(data.position)
    } else if(data.object === 'rx') {
      setRxPos(data.position)
    } else if(data.object === 'ris') {
      setRisPos(data.position)
    }
  }
  const createOnMessage = () => (e: MessageEvent) => {
    try {
      let d = JSON.parse(e.data);
      // console.log('got mess', d)
      if(d.type === 'ris_position_ack') {
          const data = d as AckDataType
          console.log('Ack', data)
          waiter.current.confirm(data.jobId, data)
          d.jobId && d.result && setMagnitude(data.result)
      } else if(d.type === 'RF_throughput'){
        if(operation === 'realtime' && realtimeOn) {
          setRealtimeMags(prev => [...prev, {index: prev.length, magnitude: d.magnitude_dB }])
        }
      } else if(d.type === 'position_update') {
        handlePosUpdate(d, setTxPosition, setRxPosition, setRisPosition)
      } else {
          // setRisPosition(d.ris);
          // setTxPosition(d.tx);
          // setRxPosition(d.rx);
      }
    } catch {
  
    }
  }

  useEffect(() => {
    if(!ws.current) return
    ws.current.onmessage = createOnMessage()
  }, [operation, realtimeOn, ])

  useEffect(() => {
    ws.current = new WebSocket("ws://"+window.location.hostname+":8080");
    ws.current.onopen = (event) => {};
    ws.current.onmessage = createOnMessage()
  }, []);
  
  const submit = (config: number[]) => measurementEnabled ? submitConfigReturn(config) : submitConfigNoFeedback(config) 

  const submitConfigReturn: ConfigSubmitter = async (configuration) => {
    const jobId = uuid()
    const operation = { passthrough: configuration, jobId}
    if (ws.current && ws.current.readyState === ws.current.OPEN) {
        ws.current.send(JSON.stringify(operation))
        setPositions(configuration)
        return (await waiter.current.wait(jobId)).result
    }
    throw 'Socket was not open'
  }

  const submitConfigNoFeedback = (configuration: number[]) => {
    const operation = { passthrough: configuration }
    if (ws.current && ws.current.readyState === ws.current.OPEN) {
      ws.current.send(JSON.stringify(operation));
      setPositions(configuration)
    } else {
      throw 'Socket was not open'
    }
  }

  let graphData: OptDataType[] = [] 
  if(operation === 'optimize') graphData = optData
  else if(operation === 'realtime') graphData = realtimeMags

  const allPositionsGiven = risPosition && txPosition && rxPosition
  const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, Math.PI*2)
    ctx.stroke()
    ctx.fill()
  }

  useEffect(() => {
    if(!canvas.current || !allPositionsGiven) return
    const ctx = canvas.current.getContext("2d")
    ctx.clearRect(0, 0, 1000, 1000)
    const scale = 20
    ctx.translate(150, 150)
    ctx.fillStyle = "#000"
    ctx.strokeStyle = "2px solid #000"
    drawCircle(ctx, scale*risPosition.x, scale*risPosition.y)
    ctx.fillStyle = "#F00"
    drawCircle(ctx, scale*rxPosition.x, scale*rxPosition.y)
    ctx.fillStyle = "#00F"
    drawCircle(ctx, scale*txPosition.x, scale*txPosition.y)
    ctx.translate(-150, -150)
  }, [risPosition, txPosition, rxPosition, canvas.current])
  


  const coupleSubmitter = async () => {
    if(!ws.current || ws.current.readyState !== WebSocket.OPEN || !allPositionsGiven) return
    
    const pos = {
      ris: { x: 0, y: 0}, 
      tx: { x: -1, y: 1}, 
      rx: { x: 0, y: 1} 
    }
    // setRisPosition(pos.ris)
    // setTxPosition(pos.tx)
    // setRxPosition(pos.rx)
    const flip = (obj) => ({ x: -obj.y, y: obj.x })
 
    const jobId = uuid()
    ws.current.send(JSON.stringify({ ris: flip(risPosition), tx: flip(txPosition), rx: flip(rxPosition), jobId }))

    try {
      var res: number[] = (await waiter.current.wait(jobId)).configuration
      setPositions(res)
    } catch(err: any) {
      console.log('err', err)
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h2 style={{ alignSelf: 'flex-start' }}>Rice-Box HUB Ctrl</h2>
      <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
        <div style={{ display: "flex", flexDirection: "column"}}>
          <h3>Positioning</h3>
          <Bars currentMagnitude={magnitude} measurementEnabled={measurementEnabled} setMeasurementEnabled={setMeasurementEnabled} setCurrentMagnitude={mag => setMagnitude(mag)} configuration={positions} submitConfiguration={submit} />
        </div>
        {
          (['optimize', 'realtime'].includes(operation)) && sideBySide ? 
            <Graph 
              onSideBySide={() => setSideBySide(false)} 
              sideBySide={true} 
              data={graphData} 
              graphHeight={260} 
              style={{ width: '50%', paddingLeft: 40 }} 
            /> : null
        }
      </div>
      
      <div style={{
        marginTop: 50,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(246, 246, 246, 0.4)', backdropFilter: 'blur(1px)',
        boxShadow: '0px 0px 10px #7d7d7d70',
        borderRadius: 8, paddingInline: 20, paddingBlock: 4
      }}>
        <h3>Mode select</h3>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Button name="couple" onClick={() => setOperation('couple')} active={operation == "couple"} />
          {/* <Button name="passthrough" onClick={() => setOperation('passthrough')} active={operation == "passthrough"} /> */}
          <Button name="optimize" onClick={() => setOperation('optimize')} active={operation == "optimize"} />
          <Button name="realtime" onClick={() => setOperation('realtime')} active={operation == "realtime"} />
        </div>
        {
          operation === 'couple' && <>
          <div>
            <p>TX: {txPosition ? 'Ok' : '--'} RX: {rxPosition ? 'Ok' : '--'} RIS: {risPosition ? 'Ok' : '--'}</p>
          </div>
          <div>
            <canvas ref={canvas} width={300} height={300} style={{ border: '1px solid lightgray'}} />
          </div>
        </>
        }
        { operation == "couple" ? 
            <Button name={allPositionsGiven ? 'Configure' : 'Awaiting position'} onClick={() => allPositionsGiven && coupleSubmitter()}  />
          : null
        }
        { operation == "passthrough" ? 
            <Manual setCurrentMagnitude={setMagnitude} submitConfiguration={submit}></Manual>
          : null
        }
        { operation == "optimize" ? <>
            <Optimize
              submitConfiguration={submitConfigReturn} 
              configuration={positions} 
              addOptData={measurement => setOptData(prev => [...prev, { index: prev.length, magnitude: measurement }])}
            />
          </>
          : null
        }
        { operation === "realtime" ? <>
            <h3>Realtime Measurement</h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button name={realtimeOn ? 'Pause' : 'Resume'} onClick={() => setRealtimeOn(prev => !prev)}></Button>
              <Button name="Clear data" onClick={() => setRealtimeMags([])}></Button>
            </div>
          </> : null
        }
      </div>
      {
        (['optimize', 'realtime'].includes(operation)) && !sideBySide ? <Graph graphHeight={600} sideBySide={false} onSideBySide={() => setSideBySide(true)} data={graphData} /> : null
      }
      
    </div>
  );
};

export default Page;
