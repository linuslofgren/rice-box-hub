/**
 * Create a job to await with and ID in one place. Finish with data in another
 */

export class Waiter<ResultType> {
    private currentJob: string | null;
    private resolver: (result: ResultType) => void
    private rejecter: (reason: string) => void
    private timeout: NodeJS.Timeout

    wait(jobId: string) {
        if(this.currentJob) this.rejecter('Other wait job took over')
        this.currentJob = jobId
        return new Promise<ResultType>((resolve, reject) => {
            this.resolver = resolve
            this.rejecter = reject
            this.timeout = setTimeout(() => {
                try {reject('Timeout')} catch {} // If it's already resolved
                if(this.currentJob === jobId) this.currentJob = null
            }, 4000)
        })
    }
    confirm(jobId: string, result: ResultType) {
        if(this.currentJob === jobId){
            this.currentJob = null
            return this.resolver(result)    
        }
    }
} 
