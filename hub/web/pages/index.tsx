import { useEffect, useRef, useState } from "react";
import { Operation } from "../../server/types";
import dynamic from "next/dynamic";
// const NoSSRComponent = dynamic(() => import("./Tests"), {
//   ssr: false,
// });

// const RIS = dynamic(() => import("./RIS.jsx"), {
//   ssr: false,
// });

const Page = () => {
  const [operation, setOperation] = useState("passthrough");
  const [risPosition, setRisPosition] = useState({ x: 0.6, y: 0.5 });
  const [txPosition, setTxPosition] = useState({ x: 0.6, y: 0.5 });
  const [rxPosition, setRxPosition] = useState({ x: 0.6, y: 0.5 });
  const [positions, setPositions] = useState(Array.from({length: 10}).map(_=>0))
  const [shadowPositions, setShadowPositions] = useState(Array.from({length: 10}).map(_=>({p: 0, show: false})))

  const ws = useRef<WebSocket>();

  useEffect(() => {

    ws.current = new WebSocket("ws://"+window.location.hostname+":8080");
    ws.current.onopen = (event) => {
    };
    ws.current.onmessage = (e) => {
      console.log(e.data);
      try {
        let d = JSON.parse(e.data);
        setRisPosition(d.ris);
        setTxPosition(d.tx);
        setRxPosition(d.rx);
      } catch {
      }
    };
  }, []);

  useEffect(()=>{
    const operation = {
      passthrough: positions
    }
    if (ws.current && ws.current.readyState == ws.current.OPEN) {
      ws.current.send(JSON.stringify(operation));
    }
  }, [positions])

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
      <h3>Positioning</h3>
      <div style={{ display: 'flex', flexDirection: 'row', marginTop: 100 }}>
        {positions.map((p, i) => <div
        
        onClick={e => {
          const r = e.currentTarget.getBoundingClientRect();
          let frac = (r.height - (e.clientY - r.top)) / r.height
          setPositions(positions => positions.map((p, j) => j == i ? frac/10 : p))
        }}

        onMouseMove={e => {
          const r = e.currentTarget.getBoundingClientRect();
          let frac = (r.height - (e.clientY - r.top)) / r.height
          setShadowPositions(positions => positions.map((p, j) => j == i ? ({show: true, p: frac/10}) : p))
        }}

        onMouseOut={e => {
          setShadowPositions(positions => positions.map((p, j) => j == i ? {p: p.p, show: false} : p))
        }}
        style={{ position: 'relative', height: 200, width: 40, display: 'flex', alignItems: 'flex-end', backgroundColor: 'rgb(250, 250, 250)', border: '1px dashed rgb(220, 220, 220)', borderRadius: 2, marginInline: 10 }} key={i}>
          <div style={{ zIndex: 1, background: 'linear-gradient(#e66465, #9198e5)', transition: 'height 0.1s', width: '100%', height:  ((p*10)*100) + '%', borderRadius: 2}}
          
          >

          </div>

          <div style={{ zIndex: 0, position: 'absolute', opacity: shadowPositions[i].show == true ? 0.4 : 0.0, transition: 'opacity 0.1s', background: 'linear-gradient(#e66465ee, #9198e5ee)', width: '100%', height:  ((shadowPositions[i].p*10)*100) + '%', borderRadius: 2}}
          
          >

          </div>
        </div>)}
      </div>
      {/* <RIS />
      <NoSSRComponent
        x={risPosition.x}
        y={risPosition.y}
        rx={txPosition.x}
        ry={txPosition.y}
        tx={rxPosition.x}
        ty={rxPosition.y}
      /> */}

      <div style={{
        marginTop: 80,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(246, 246, 246, 0.4)', backdropFilter: 'blur(1px)',
        boxShadow: '0px 0px 10px #7d7d7d70',
        borderRadius: 8, paddingInline: 20, paddingBlock: 4
      }}>
        <h3>Mode select</h3>
        <div style={{
        display: 'flex', flexDirection: 'row'}}>
          <Mode name="couple" setOperation={setOperation} active={operation == "couple"} />
          <Mode name="passthrough" setOperation={setOperation} active={operation == "passthrough"} />
          
        </div>
        {operation == "passthrough" ? 
            <Manual setPositions={setPositions}></Manual>
          : null}
      </div>
    </div>
  );
};

const Mode = ({ name, active, setOperation }) => <div onClick={() => setOperation(name)}
  style={{
    padding: 10, paddingInline: 20, margin: 8, backgroundColor: active ? 'rgba(220, 220, 220, 0.4)' : 'rgba(244, 244, 244, 0.4)',
    borderRadius: 8, WebkitBackdropFilter: 'blur(1px)', backdropFilter: 'blur(1px)',
    color: active ? '#9d9696' : '#625c5c',
    verticalAlign: 'center',
    boxShadow: active ? '#afa3a3 1px 1px 3px inset, inset rgb(255 255 255 / 96%) -1px -1px 20px' : 'inset 3px 2px 4px white, 1px 1px 3px #84848496'
  }}>
  {name}
</div>


const Manual = ({ setPositions }) =>{
  const [value, setValue] = useState("0")
  const [direction, setDirection] = useState(false)
  const [wavelength, setWavelength] = useState(0.062456762083333*2)
  const calculate = (dx) => {
    let pos = Array.from({length: 10}).map((_, i)=>(Number(dx)*i)%(wavelength/2))
    console.log(pos)
    if(direction) {
      pos.reverse()
    }
    pos = pos.map(p => 0.082-p)
    setPositions(pos)
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
    <input style={{border: '1px solid white', backgroundColor: 'rgb(244, 244, 244)', padding: 10, borderRadius: 8, marginBottom: 10}} value={value} onChange={e=>setValue((e.target.value))}></input>
    <input type="checkbox" checked={direction} onChange={e=>setDirection(e.target.checked)}></input>
    <button onClick={()=>calculate(value)}>Activate</button>
  </div>
}

export default Page;
