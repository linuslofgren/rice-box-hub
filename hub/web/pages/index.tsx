import { useEffect, useRef, useState } from "react";
import { Operation } from "../../server/types";
import dynamic from "next/dynamic";
const NoSSRComponent = dynamic(() => import("./Tests"), {
  ssr: false,
});

const RIS = dynamic(() => import("./RIS.jsx"), {
  ssr: false,
});

const Page = () => {
  const [operation, setOperation] = useState("");
  const [risPosition, setRisPosition] = useState({ x: 0.6, y: 0.5 });
  const [txPosition, setTxPosition] = useState({ x: 0.6, y: 0.5 });
  const [rxPosition, setRxPosition] = useState({ x: 0.6, y: 0.5 });

  const ws = useRef<WebSocket>();

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");
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

    const i = setInterval(() => {
      let operation: Operation = null;
      const type = Math.floor(Math.random() * 3) + 1;
      switch (type) {
        case 1:
          setOperation("ANGLE");
          operation = { angle: 45 };
          break;
        case 2:
          setOperation("COUPLE");
          operation = {
            couple: {
              rx: { x: 1, y: 1 },
              tx: { x: 1, y: 1 },
              ris: { x: 1, y: 1 },
            },
          };
          break;
        case 3:
          setOperation("FOCUS");
          operation = {
            focus: {
              rx: { x: 1, y: 1 },
              tx: { x: 1, y: 1 },
              ris: { x: 1, y: 1 },
            },
          };
          break;
      }
      if (ws.current) {
        ws.current.send(JSON.stringify(operation));
      }
    }, 1000);

    return () => {
      clearInterval(i);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h2>Rice-Box HUB CONTROLLER</h2>
      <h4>Control sequence for t=50</h4>
      <h4>
        Solving for <span style={{ width: 150 }}>{operation}</span>{" "}
        <span style={{ width: 150 }}>{new Date().toLocaleTimeString()}</span>
      </h4>
      <RIS />
      <NoSSRComponent
        x={risPosition.x}
        y={risPosition.y}
        rx={txPosition.x}
        ry={txPosition.y}
        tx={rxPosition.x}
        ty={rxPosition.y}
      />
    </div>
  );
};

export default Page;
