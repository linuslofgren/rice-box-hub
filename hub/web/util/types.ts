export type ConfigSubmitter = (config: number[]) => Promise<number>

export type OperationMode = "passthrough" | "couple" | "optimize" | "realtime"

export type OptDataType = {
  index: number,
  magnitude: number
}