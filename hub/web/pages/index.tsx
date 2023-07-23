import { useEffect, useRef, useState } from "react";
import Bars from "../components/Bars";
import Button from "../components/Button";
import Manual from "../components/Manual";
import Optimize from "../components/Optimize";
import { NUM_ELMS } from "../constants";
import { v4 as uuid } from 'uuid'
import { ConfigSubmitter, OperationMode, OptDataType } from "../util/types";
import { Waiter } from "../util/Waiter";
import Graph from "../components/Graph";

const Page = () => {
  const [operation, setOperation] = useState<OperationMode>("optimize");
  const [risPosition, setRisPosition] = useState({ x: 0.6, y: 0.5 });
  const [txPosition, setTxPosition] = useState({ x: 0.6, y: 0.5 });
  const [rxPosition, setRxPosition] = useState({ x: 0.6, y: 0.5 });
  const [positions, setPositions] = useState<number[]>(Array(NUM_ELMS).fill(0))
  const [magnitude, setMagnitude] = useState<number | null>(null)
  const [measurementEnabled, setMeasurementEnabled] = useState(true)
  const [realtimeMags, setRealtimeMags] = useState<OptDataType[]>([])
  const [optData, setOptData] = useState<OptDataType[]>([])
  const [sideBySide, setSideBySide] = useState(false)
  const waiter = useRef(new Waiter<number>())
  const ws = useRef<WebSocket>();

  useEffect(() => {
    if(!ws.current) return
    ws.current.onmessage = (e) => {
      try {
        let d = JSON.parse(e.data);
        if(d.type === 'ris_position_ack') {
            waiter.current.confirm(d.jobId as string, d.result)
            d.jobId && setMagnitude(d.result)
        }
        else if(d.type === 'RF_throughput'){
          if(operation === 'realtime') {
            setRealtimeMags(prev => [...prev, {index: prev.length, magnitude: d.magnitude_dB }])
          }
        } else {
            setRisPosition(d.ris);
            setTxPosition(d.tx);
            setRxPosition(d.rx);
        }
      } catch {

      }
    };
  }, [operation])

  useEffect(() => {
    ws.current = new WebSocket("ws://"+window.location.hostname+":8080");
    ws.current.onopen = (event) => {};
  }, []);
  
  const submit = (config: number[]) => measurementEnabled ? submitConfigReturn(config) : submitConfigNoFeedback(config) 

  const submitConfigReturn: ConfigSubmitter = async (configuration) => {
    const jobId = uuid()
    const operation = { passthrough: configuration, jobId}
    if (ws.current && ws.current.readyState === ws.current.OPEN) {
        ws.current.send(JSON.stringify(operation))
        setPositions(configuration)
        return waiter.current.wait(jobId)
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
          <Button name="passthrough" onClick={() => setOperation('passthrough')} active={operation == "passthrough"} />
          <Button name="optimize" onClick={() => setOperation('optimize')} active={operation == "optimize"} />
          <Button name="realtime" onClick={() => setOperation('realtime')} active={operation == "realtime"} />
        </div>
       
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
            <Button name="Clear data" onClick={() => setRealtimeMags([])}></Button>
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
