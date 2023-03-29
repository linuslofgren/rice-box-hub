import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log("Connect")
  ws.on('error', console.error);

  ws.on('message', function message(data) {

    console.log('received: %s', data);
    try {
      console.log("PARSING")
      let d = JSON.parse(String(data))
      console.log(d)
      wss.clients.forEach(function each(client) {
        client.send(JSON.stringify({
          ris: {
            x: d.ris.x,
            y: d.ris.y
          },
          rx: {
            x: d.rx.x,
            y: d.rx.y
          },
          tx: {
            x: d.tx.x,
            y: d.tx.y
          }
        }));
      });
    } catch (e) { console.log(e) }

  });
  // setInterval(() => {

  // }, 10)

});
