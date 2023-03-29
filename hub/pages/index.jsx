import { useEffect, useRef, useState } from 'react'

import dynamic from "next/dynamic";
const NoSSRComponent = dynamic(() => import("./Tests"), {
  ssr: false,
});

const RIS = dynamic(() => import("./RIS"), {
  ssr: false,
});

const Page = () => {

  const [risPosition, setRisPosition] = useState({ x: 0.6, y: 0.5 })
  const [txPosition, setTxPosition] = useState({ x: 0.6, y: 0.5 })
  const [rxPosition, setRxPosition] = useState({ x: 0.6, y: 0.5 })

  const ws = useRef()

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');
    ws.current.onopen = (event) => {

    }
    ws.current.onmessage = (e) => {
      // console.log(e.data)
      try {
        // cosole.log(e.data)
        let d = JSON.parse(e.data)
        setRisPosition(d.ris)
        setTxPosition(d.tx)
        setRxPosition(d.rx)
      } catch {

      }

    }
  }, [])

  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
    <h2>Rice-Box HUB CONTROLLER</h2>
    <h4>Controll sequence for t=50</h4>
    <RIS />
    <NoSSRComponent
      x={risPosition.x}
      y={risPosition.y}
      rx={txPosition.x} ry={txPosition.y}
      tx={rxPosition.x} ty={rxPosition.y}
    />
  </div>
}

export default Page
