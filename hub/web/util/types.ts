export type ConfigSubmitter = (config: number[]) => Promise<number>

export type OperationMode = "passthrough" | "couple" | "optimize"

export type OptDataType = {
  index: number,
  magnitude: number
}