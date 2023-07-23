export type Position = {
  x: number;
  y: number;
};

type UnionKeys<T> = T extends T ? keyof T : never;

// Expand Records into objects for better intellisense
type Expand<T> = T extends T ? { [K in keyof T]: T[K] } : never;

// OneOf taken (somewhat) from
// https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types#comment123255834_53229567
type OneOf<T extends Record<string | number | symbol, unknown>[]> = {
  [K in keyof T]: Expand<T[K] & Partial<Record<Exclude<UnionKeys<T[number]>, keyof T[K]>, never>>>;
}[number];

type Couple = {
  couple: ObjectPositions;
}

type Focus = {
  focus: ObjectPositions;
}

type Angle = {
  angle: number;
}

export type Passthrough = {
  passthrough: number[]
}

export type Operation = OneOf<[Couple, Focus, Angle, Passthrough]>

type ObjectPositions = {
  tx: Position;
  rx: Position;
  ris: Position;
};

export type Configuration = number[];

export type ObjectState = ObjectPositions & { configuration: Configuration };

export type PositionUpdate = {
    type: 'position_update'
  position_update: ObjectPositions;
} & ObjectPositions;

export type WebSocketMessage = OneOf<[PositionUpdate, Operation]>

export type WebSocketResponse = ObjectState;

export type AckDataType = { type: 'ris_position_ack', jobId?: string, result?: number, timestamp?: number }
export type RFThroughType = { type: 'RF_throughput' } & RFData 

export type DisplacementJobResult = { configuration: Configuration, jobId?: string }

export type DisplacementJob = () => Promise<DisplacementJobResult>

export type RFData = {
  magnitude_dB: number,
  timestamp: number
}