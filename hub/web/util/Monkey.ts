import { MAX_DISP, NUM_ELMS } from "../constants"
import { ConfigSubmitter } from "./types"
import { argminmax } from "./util"

const numCandidates = 3
const stepSize = 0.020

export class Monkey {
  private minimize: boolean = false
  private progress: number[]
  private tester: ConfigSubmitter
  private run: boolean = true
  private numFails: number

  constructor(test?: ConfigSubmitter) {
    this.tester = test
    this.progress = []
  }

  async optimize(startPositions: number[], numIterations: number, minimze?: boolean) {
    if(this.tester === undefined) throw 'Test function must be specified before optimizing.'
    this.run = true
    this.minimize = !!minimze
    this.progress = []
    this.numFails = 0
    
    const [afterFirstConf, progress] = await this.firstIteration(startPositions)
    this.progress = progress

    let configuration = afterFirstConf
    for(let i = 0; i < numIterations && this.run; i++) {
      const [optimizedConfig, oneIterationProgress] = await this.optIteration(configuration, stepSize/(1+i))
      this.progress = this.progress.concat(oneIterationProgress)
      configuration = optimizedConfig
    }
    this.numFails = 0
  }

  cancel() {
    this.run = false
    this.numFails = 0
  }

  private async test(config: number[]): Promise<number> {
    try {
      return await this.tester(config)
    } catch(err: any) {
      this.numFails++
      console.error('Failed to test configuration: ', err)
      if(this.numFails >= 6) {
        this.cancel()
        throw 'Max number of fails exceeded. Cancelling optimization'
      }
      throw 'Failed to test'
    }
  }
  private async firstIteration(startConfig: number[]): Promise<[number[], number[]]>  {
    const INITIAL_PROBES = 6
    const configuration = [...startConfig]
    const iterationProgress: number[] = [] //Save progress over time

    for(let i = 0; i < NUM_ELMS && this.run; i++) {
      // Try cover full area to find the general vicinity of max
      const candidatePositions: number[] = [...Array(INITIAL_PROBES).keys()].map(j => 
        (j / (INITIAL_PROBES-1)) * MAX_DISP
      )

      const candidateResults: number[] = []
      for(let p=0; p < candidatePositions.length && this.run; p++) {
        configuration[i] = candidatePositions[p]
        try {
          candidateResults.push(await this.test(configuration)) 
        } catch(err: any) {
          candidatePositions.splice(p, 1)
          p--
        }
      }
      const [bestVal, bestIdx] = argminmax(candidateResults, this.minimize)
      configuration[i] = candidatePositions[bestIdx]
    }
    return [configuration, iterationProgress]
  }

  private async optIteration(startConfig: number[], stepSize: number): Promise<[number[], number[]]> {
    const configuration = [...startConfig]
    const iterationProgress: number[] = [] //Save progress over time

    for(let i = 0; i < NUM_ELMS && this.run; i++) {
      // Create evenly spaced points centered around current position
      const candidatePositions: number[] = [...Array(numCandidates).keys()].map(j => 
        Math.max(Math.min((configuration[i] - stepSize * (numCandidates-1) / 2) + stepSize*j, MAX_DISP), 0) // Cap values outside range
      )

      const candidateResults: number[] = []
      for(let p=0; p < candidatePositions.length && this.run; p++) {
        configuration[i] = candidatePositions[p]
        try {
          candidateResults.push(await this.test(configuration)) 
        } catch(err: any) {
          candidatePositions.splice(p, 1)
          p--
        }
      }
      const [bestVal, bestIdx] = argminmax(candidateResults, this.minimize)
      configuration[i] = candidatePositions[bestIdx]
    }
    return [configuration, iterationProgress]
  }

  setTestFunction(test: ConfigSubmitter) {
    this.tester = test
  }
} 
