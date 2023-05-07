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

type Passthrough = {
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

export type WebSocketMessage = {
  position_update: ObjectPositions;
} & ObjectPositions;

export type WebSocketResponse = ObjectState;
