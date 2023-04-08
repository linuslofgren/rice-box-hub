export type Position = {
  x: number;
  y: number;
};

export type Operation = {
  couple?: ObjectPositions;
  focus?: ObjectPositions;
  angle?: number;
};

type ObjectPositions = {
  tx: Position;
  rx: Position;
  ris: Position;
};

export type Configuration = number[];

export type ObjectState = ObjectPositions & { configuration: Configuration };

export type WebSocketMessage = {
  position_update: ObjectPositions;
} & ObjectPositions;

export type WebSocketResponse = ObjectState;
