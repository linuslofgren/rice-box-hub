import { NUM_ELMS } from "../constants"
import { ConfigSubmitter } from "./types"
import { argminmax } from "./util"

const numCandidates = 3
const stepSize = 0.01
const numIterations = 1


export class Monkey {
  private minimize: boolean = false
  private progress: number[]
  private tester: ConfigSubmitter
  private run: boolean = true

  constructor(test?: ConfigSubmitter) {
    this.tester = test
    this.progress = []
  }

  async optimize(startPositions: number[], minimze?: boolean) {
    if(this.tester === undefined) throw 'Test function must be specified before optimizing.'
    this.run = true
    this.minimize = !!minimze
    this.progress = []
    let configuration = startPositions
    for(let i = 0; i < numIterations && this.run; i++) {
      const [optimizedConfig, oneIterationProgress] = await this.optIteration(configuration)
      this.progress = this.progress.concat(oneIterationProgress)
      configuration = optimizedConfig
    }
  }

  cancel() {
    this.run = false
  }

  private async optIteration(startConfig: number[]): Promise<[number[], number[]]> {
    const configuration = [...startConfig]
    const iterationProgress: number[] = [] //Save progress over time

    for(let i = 0; i < NUM_ELMS && this.run; i++) {
      // Create evenly spaced points centered around current position
      const candidatePositions: number[] = [...Array(numCandidates).keys()].map(j => 
        (configuration[i] - stepSize * (numCandidates-1) / 2) + stepSize*j
      )

      const candidateResults: number[] = []
      for(const pos of candidatePositions) {
        configuration[i] = pos
        candidateResults.push(await this.tester(configuration)) 
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
