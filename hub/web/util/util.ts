export const argminmax = (arr: number[], minimize?: boolean) => {
  let opt = arr[0]
  let optIdx = 0

  for(let i = 1; i < arr.length; i++) {
    if(minimize && arr[i] < opt || !minimize && arr[i] > opt) {
      opt = arr[i]
      optIdx = i
    }
  }
  return [opt, optIdx]
}