import { Dispatch, SetStateAction } from "react"

export type ConfigSubmitter = (config: number[]) => Promise<number>

export type OperationMode = "passthrough" | "couple" | "optimize" | "realtime"

export type OptDataType = {
  index: number,
  magnitude: number
}

export type Setter = Dispatch<SetStateAction<{ x: number, y: number }>>

export type Position = { x: number, y: number }

export type AckDataType = { 
  type: 'ris_position_ack', 
  jobId?: string, 
  result?: number, 
  timestamp?: number, 
  configuration: number[] 
}
