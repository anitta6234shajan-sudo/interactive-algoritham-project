import type { Algorithm, Step } from './types';
import { sampleGraph } from './graphData';
import { bfsSteps, dfsSteps, dijkstraSteps } from './graphAlgorithms';

function makeStep(
  array: number[],
  highlights: { indices: number[]; type: string }[],
  comparisons: number,
  swaps: number,
  description: string,
  codeLine?: number,
): Step {
  return {
    array: [...array],
    highlights: highlights as Step['highlights'],
    comparisons,
    swaps,
    description,
    codeLine,
  };
}

function bubbleSort(input: number[]): Step[] {
  const arr = [...input];
  const steps: Step[] = [];
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;

  steps.push(makeStep(arr, [], 0, 0, 'Starting Bubble Sort. We will compare adjacent pairs and swap if out of order.', 0));

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      steps.push(makeStep(arr, [{ indices: [j, j + 1], type: 'compare' }], comparisons, swaps, `Compare ${arr[j]} and ${arr[j + 1]}.`, 3));
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        swapped = true;
        steps.push(makeStep(arr, [{ indices: [j, j + 1], type: 'swap' }], comparisons, swaps, `Swap: ${arr[j + 1]} and ${arr[j]} are out of order.`, 5));
      }
    }
    steps.push(makeStep(arr, [{ indices: [n - 1 - i], type: 'sorted' }], comparisons, swaps, `Element at index ${n - 1 - i} is now in its final sorted position.`, 8));
    if (!swapped) {
      steps.push(makeStep(arr, [], comparisons, swaps, 'No swaps in this pass — the array is already sorted!', 9));
      break;
    }
  }

  const allIdx = arr.map((_, i) => i);
  steps.push(makeStep(arr, [{ indices: allIdx, type: 'sorted' }], comparisons, swaps, 'Bubble Sort complete! The array is fully sorted.', 12));
  return steps;
}

function selectionSort(input: number[]): Step[] {
  const arr = [...input];
  const steps: Step[] = [];
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;

  steps.push(makeStep(arr, [], 0, 0, 'Starting Selection Sort. We find the minimum in the unsorted portion and move it to the front.', 0));

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push(makeStep(arr, [{ indices: [i], type: 'pivot' }], comparisons, swaps, `Looking for the minimum starting from index ${i}.`, 2));
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      steps.push(makeStep(arr, [{ indices: [minIdx, j], type: 'compare' }], comparisons, swaps, `Compare current min ${arr[minIdx]} with ${arr[j]}.`, 4));
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        steps.push(makeStep(arr, [{ indices: [minIdx], type: 'highlight' }], comparisons, swaps, `New minimum found: ${arr[minIdx]} at index ${minIdx}.`, 5));
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      swaps++;
      steps.push(makeStep(arr, [{ indices: [i, minIdx], type: 'swap' }], comparisons, swaps, `Swap ${arr[minIdx]} with ${arr[i]} to place the minimum at index ${i}.`, 7));
    }
    steps.push(makeStep(arr, [{ indices: [i], type: 'sorted' }], comparisons, swaps, `Index ${i} is now sorted.`, 8));
  }

  const allIdx = arr.map((_, i) => i);
  steps.push(makeStep(arr, [{ indices: allIdx, type: 'sorted' }], comparisons, swaps, 'Selection Sort complete!', 11));
  return steps;
}

function insertionSort(input: number[]): Step[] {
  const arr = [...input];
  const steps: Step[] = [];
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;

  steps.push(makeStep(arr, [{ indices: [0], type: 'sorted' }], 0, 0, 'Starting Insertion Sort. The first element is trivially sorted.', 0));

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    steps.push(makeStep(arr, [{ indices: [i], type: 'pivot' }], comparisons, swaps, `Take element ${key} at index ${i} as the key to insert.`, 2));
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      comparisons++;
      steps.push(makeStep(arr, [{ indices: [j, j + 1], type: 'compare' }], comparisons, swaps, `Compare ${arr[j]} with key ${key}: ${arr[j]} > ${key}, shift right.`, 4));
      arr[j + 1] = arr[j];
      swaps++;
      steps.push(makeStep(arr, [{ indices: [j + 1], type: 'highlight' }], comparisons, swaps, `Shift ${arr[j + 1]} from index ${j} to index ${j + 1}.`, 5));
      j--;
    }
    if (j >= 0) comparisons++;
    arr[j + 1] = key;
    steps.push(makeStep(arr, [{ indices: [...Array(i + 1).keys()], type: 'sorted' }], comparisons, swaps, `Insert key ${key} at index ${j + 1}. Elements 0..${i} are now sorted.`, 8));
  }

  const allIdx = arr.map((_, i) => i);
  steps.push(makeStep(arr, [{ indices: allIdx, type: 'sorted' }], comparisons, swaps, 'Insertion Sort complete!', 11));
  return steps;
}

function quickSort(input: number[]): Step[] {
  const arr = [...input];
  const steps: Step[] = [];
  let comparisons = 0;
  let swaps = 0;
  const sortedFlags: boolean[] = arr.map(() => false);

  function partition(low: number, high: number): number {
    const pivot = arr[high];
    steps.push(makeStep(arr, [{ indices: [high], type: 'pivot' }], comparisons, swaps, `Partition [${low}..${high}]. Pivot = ${pivot} (index ${high}).`, 2));
    let i = low - 1;
    for (let j = low; j < high; j++) {
      comparisons++;
      steps.push(makeStep(arr, [{ indices: [j, high], type: 'compare' }], comparisons, swaps, `Compare ${arr[j]} with pivot ${pivot}.`, 4));
      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swaps++;
          steps.push(makeStep(arr, [{ indices: [i, j], type: 'swap' }], comparisons, swaps, `Swap ${arr[i]} and ${arr[j]} (element < pivot).`, 6));
        }
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    swaps++;
    steps.push(makeStep(arr, [{ indices: [i + 1, high], type: 'swap' }], comparisons, swaps, `Place pivot ${arr[i + 1]} at index ${i + 1}.`, 9));
    sortedFlags[i + 1] = true;
    steps.push(makeStep(arr, [{ indices: [i + 1], type: 'sorted' }], comparisons, swaps, `Pivot is now in its final sorted position.`, 10));
    return i + 1;
  }

  function qs(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      qs(low, pi - 1);
      qs(pi + 1, high);
    } else if (low === high) {
      sortedFlags[low] = true;
      steps.push(makeStep(arr, [{ indices: [low], type: 'sorted' }], comparisons, swaps, `Single element at index ${low} is sorted.`, 12));
    }
  }

  steps.push(makeStep(arr, [], 0, 0, 'Starting Quick Sort. We pick a pivot, partition around it, and recurse.', 0));
  qs(0, arr.length - 1);
  const allIdx = arr.map((_, i) => i);
  steps.push(makeStep(arr, [{ indices: allIdx, type: 'sorted' }], comparisons, swaps, 'Quick Sort complete!', 14));
  return steps;
}

function mergeSort(input: number[]): Step[] {
  const arr = [...input];
  const steps: Step[] = [];
  let comparisons = 0;
  let swaps = 0;

  function merge(low: number, mid: number, high: number) {
    const left = arr.slice(low, mid + 1);
    const right = arr.slice(mid + 1, high + 1);
    let i = 0, j = 0, k = low;
    steps.push(makeStep(arr, [{ indices: Array.from({ length: high - low + 1 }, (_, x) => low + x), type: 'highlight' }], comparisons, swaps, `Merge subarrays [${low}..${mid}] and [${mid + 1}..${high}].`, 4));
    while (i < left.length && j < right.length) {
      comparisons++;
      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i++;
      } else {
        arr[k] = right[j];
        j++;
        swaps++;
      }
      steps.push(makeStep(arr, [{ indices: [k], type: 'swap' }], comparisons, swaps, `Place ${arr[k]} at index ${k}.`, 6));
      k++;
    }
    while (i < left.length) {
      arr[k] = left[i];
      steps.push(makeStep(arr, [{ indices: [k], type: 'highlight' }], comparisons, swaps, `Copy remaining ${arr[k]} to index ${k}.`, 8));
      i++; k++;
    }
    while (j < right.length) {
      arr[k] = right[j];
      steps.push(makeStep(arr, [{ indices: [k], type: 'highlight' }], comparisons, swaps, `Copy remaining ${arr[k]} to index ${k}.`, 8));
      j++; k++;
    }
    steps.push(makeStep(arr, [{ indices: Array.from({ length: high - low + 1 }, (_, x) => low + x), type: 'sorted' }], comparisons, swaps, `Merged range [${low}..${high}] is now sorted.`, 10));
  }

  function ms(low: number, high: number) {
    if (low < high) {
      const mid = Math.floor((low + high) / 2);
      steps.push(makeStep(arr, [{ indices: [low, mid, high], type: 'highlight' }], comparisons, swaps, `Split [${low}..${high}] at mid ${mid}.`, 2));
      ms(low, mid);
      ms(mid + 1, high);
      merge(low, mid, high);
    }
  }

  steps.push(makeStep(arr, [], 0, 0, 'Starting Merge Sort. We recursively split the array, then merge sorted halves.', 0));
  ms(0, arr.length - 1);
  const allIdx = arr.map((_, i) => i);
  steps.push(makeStep(arr, [{ indices: allIdx, type: 'sorted' }], comparisons, swaps, 'Merge Sort complete!', 13));
  return steps;
}

function linearSearch(input: number[]): Step[] {
  const target = Math.min(...input);
  const arr = [...input];
  const steps: Step[] = [];
  let comparisons = 0;

  steps.push(makeStep(arr, [], 0, 0, `Linear Search: looking for value ${target}. We check each element one by one.`, 0));

  for (let i = 0; i < arr.length; i++) {
    comparisons++;
    steps.push(makeStep(arr, [{ indices: [i], type: 'compare' }], comparisons, 0, `Check index ${i}: ${arr[i]} vs target ${target}.`, 2));
    if (arr[i] === target) {
      steps.push(makeStep(arr, [{ indices: [i], type: 'sorted' }], comparisons, 0, `Found ${target} at index ${i}!`, 3));
      break;
    }
  }
  steps.push(makeStep(arr, [{ indices: [arr.indexOf(target)], type: 'sorted' }], comparisons, 0, 'Linear Search complete!', 6));
  return steps;
}

function binarySearch(input: number[]): Step[] {
  const sorted = [...input].sort((a, b) => a - b);
  const target = sorted[Math.floor(sorted.length / 2)];
  const arr = sorted;
  const steps: Step[] = [];
  let comparisons = 0;
  let lo = 0, hi = arr.length - 1;

  steps.push(makeStep(arr, [], 0, 0, `Binary Search on sorted array, looking for value ${target}.`, 0));

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    comparisons++;
    steps.push(makeStep(arr, [{ indices: [lo, hi], type: 'highlight' }, { indices: [mid], type: 'pivot' }], comparisons, 0, `Search range [${lo}..${hi}]. Mid = ${mid}, value = ${arr[mid]}.`, 2));
    if (arr[mid] === target) {
      steps.push(makeStep(arr, [{ indices: [mid], type: 'sorted' }], comparisons, 0, `Found ${target} at index ${mid}!`, 4));
      break;
    } else if (arr[mid] < target) {
      lo = mid + 1;
      steps.push(makeStep(arr, [{ indices: [lo, hi], type: 'highlight' }], comparisons, 0, `${arr[mid]} < ${target}, search right half.`, 5));
    } else {
      hi = mid - 1;
      steps.push(makeStep(arr, [{ indices: [lo, hi], type: 'highlight' }], comparisons, 0, `${arr[mid]} > ${target}, search left half.`, 6));
    }
  }
  steps.push(makeStep(arr, [], comparisons, 0, 'Binary Search complete!', 9));
  return steps;
}

function dynamicProgramming(input: number[]): Step[] {
  const values = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
  const steps: Step[] = [];
  let comparisons = 0;
  const built: number[] = [];
  steps.push(makeStep(values, [], 0, 0, 'Dynamic Programming: build the Fibonacci table from smaller answers instead of repeating work.', 0));
  values.forEach((value, index) => {
    built.push(index);
    steps.push(makeStep(values, [{ indices: [...built], type: 'sorted' }, { indices: [index], type: 'highlight' }], ++comparisons, 0, index < 2 ? `Base case: F(${index}) = ${value}.` : `Use the stored answers F(${index - 1}) + F(${index - 2}) = ${value}.`, 2));
  });
  steps.push(makeStep(values, [{ indices: values.map((_, i) => i), type: 'sorted' }], comparisons, 0, 'Dynamic Programming complete! Every subproblem was solved once and reused.', 5));
  return steps;
}

function greedyAlgorithm(input: number[]): Step[] {
  const coins = [1, 2, 5, 10, 20, 50];
  const target = 37;
  const chosen: number[] = [];
  const steps: Step[] = [];
  let remaining = target;
  steps.push(makeStep(coins, [], 0, 0, `Greedy Algorithm: make ${target} using the largest coin that fits at every step.`, 0));
  for (let i = coins.length - 1; i >= 0; i--) {
    while (remaining >= coins[i]) {
      remaining -= coins[i];
      chosen.push(i);
      steps.push(makeStep(coins, [{ indices: [i], type: 'sorted' }, { indices: chosen, type: 'highlight' }], chosen.length, 0, `Choose ${coins[i]}. Remaining amount: ${remaining}.`, 3));
    }
  }
  steps.push(makeStep(coins, [{ indices: chosen, type: 'sorted' }], chosen.length, 0, `Greedy complete! Coins chosen: ${chosen.map((i) => coins[i]).join(' + ')}.`, 6));
  return steps;
}

function divideAndConquer(input: number[]): Step[] {
  const arr = [...input].sort((a, b) => a - b);
  const steps: Step[] = [];
  let comparisons = 0;
  function split(left: number, right: number): void {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    steps.push(makeStep(arr, [{ indices: [left, mid, right], type: 'pivot' }], comparisons, 0, `Divide range [${left}..${right}] into [${left}..${mid}] and [${mid + 1}..${right}].`, 2));
    split(left, mid);
    split(mid + 1, right);
    comparisons++;
    steps.push(makeStep(arr, [{ indices: Array.from({ length: right - left + 1 }, (_, i) => left + i), type: 'sorted' }], comparisons, 0, `Combine the solved halves into range [${left}..${right}].`, 5));
  }
  steps.push(makeStep(arr, [], 0, 0, 'Divide and Conquer: break a problem into smaller parts, solve them, then combine the results.', 0));
  split(0, arr.length - 1);
  steps.push(makeStep(arr, [{ indices: arr.map((_, i) => i), type: 'sorted' }], comparisons, 0, 'Divide and Conquer complete!', 7));
  return steps;
}

function hashing(input: number[]): Step[] {
  const values = [12, 25, 38, 41, 56, 63, 77, 84];
  const target = 56;
  const steps: Step[] = [];
  let comparisons = 0;
  steps.push(makeStep(values, [], 0, 0, `Hashing: calculate a bucket for ${target}, then jump directly to its stored location.`, 0));
  values.forEach((value, index) => {
    comparisons++;
    const isTarget = value === target;
    steps.push(makeStep(values, [{ indices: [index], type: isTarget ? 'sorted' : 'compare' }], comparisons, 0, isTarget ? `Hash lookup found ${target} at bucket ${index}.` : `Bucket ${index}: ${value} is not the target.`, 3));
    if (isTarget) return;
  });
  steps.push(makeStep(values, [{ indices: [values.indexOf(target)], type: 'sorted' }], comparisons, 0, 'Hashing complete! Average lookup time is O(1).', 6));
  return steps;
}

function twoPointer(input: number[]): Step[] {
  const arr = [2, 4, 7, 9, 11, 15, 18];
  const target = 20;
  const steps: Step[] = [];
  let left = 0;
  let right = arr.length - 1;
  let comparisons = 0;
  steps.push(makeStep(arr, [{ indices: [left, right], type: 'highlight' }], 0, 0, `Two Pointer Technique: find two numbers that add to ${target}. Start at both ends.`, 0));
  while (left < right) {
    const sum = arr[left] + arr[right];
    comparisons++;
    if (sum === target) {
      steps.push(makeStep(arr, [{ indices: [left, right], type: 'sorted' }], comparisons, 0, `${arr[left]} + ${arr[right]} = ${target}. Pair found!`, 4));
      break;
    }
    const oldLeft = left;
    const oldRight = right;
    if (sum < target) left++; else right--;
    steps.push(makeStep(arr, [{ indices: [oldLeft, oldRight], type: 'compare' }, { indices: [left, right], type: 'highlight' }], comparisons, 0, `${arr[oldLeft]} + ${arr[oldRight]} = ${sum}; move the ${sum < target ? 'left' : 'right'} pointer.`, 3));
  }
  return steps;
}

function slidingWindow(input: number[]): Step[] {
  const arr = [4, 2, 7, 8, 1, 6, 3, 9];
  const windowSize = 3;
  const steps: Step[] = [];
  let bestStart = 0;
  let bestSum = 0;
  let sum = 0;
  steps.push(makeStep(arr, [{ indices: [0, 1, 2], type: 'highlight' }], 0, 0, `Sliding Window: find the largest sum of ${windowSize} consecutive values.`, 0));
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    if (i >= windowSize) sum -= arr[i - windowSize];
    if (i >= windowSize - 1) {
      const start = i - windowSize + 1;
      if (sum > bestSum) { bestSum = sum; bestStart = start; }
      steps.push(makeStep(arr, [{ indices: Array.from({ length: windowSize }, (_, j) => start + j), type: sum === bestSum ? 'sorted' : 'highlight' }], i + 1, 0, `Window [${start}..${i}] has sum ${sum}. Best sum so far: ${bestSum}.`, 3));
    }
  }
  steps.push(makeStep(arr, [{ indices: Array.from({ length: windowSize }, (_, j) => bestStart + j), type: 'sorted' }], arr.length, 0, `Sliding Window complete! Maximum sum is ${bestSum}.`, 6));
  return steps;
}

function recursion(input: number[]): Step[] {
  const values = [1, 2, 3, 4, 5, 6, 7, 8];
  const steps: Step[] = [];
  function factorial(n: number): number {
    steps.push(makeStep(values, [{ indices: [n - 1], type: 'pivot' }], n, 0, `Call factorial(${n}).${n === 1 ? ' Base case reached: return 1.' : ' Pause and call factorial(' + (n - 1) + ').'}`, 2));
    if (n === 1) return 1;
    const result = n * factorial(n - 1);
    steps.push(makeStep(values, [{ indices: [n - 1], type: 'sorted' }], n, 0, `Return from factorial(${n}): ${n} × factorial(${n - 1}) = ${result}.`, 5));
    return result;
  }
  steps.push(makeStep(values, [], 0, 0, 'Recursion: a function solves a smaller version of the same problem until it reaches a base case.', 0));
  factorial(values.length);
  steps.push(makeStep(values, [{ indices: values.map((_, i) => i), type: 'sorted' }], values.length, 0, 'Recursion complete! The calls returned back up the call stack.', 7));
  return steps;
}

function techniqueAlgorithm(
  id: string,
  name: string,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
  description: string,
  run: (input: number[]) => Step[],
  code: string[],
  question: string,
  options: string[],
  answerIndex: number,
  explanation: string,
  timeComplexity: { best: string; average: string; worst: string },
  spaceComplexity: string,
): Algorithm {
  return {
    id, name, category: 'Techniques', difficulty, description, timeComplexity, spaceComplexity,
    code, visualizer: 'array', run,
    quiz: [{ question, options, answerIndex, explanation }],
  };
}

const techniqueAlgorithms: Algorithm[] = [
  techniqueAlgorithm('dynamic-programming', 'Dynamic Programming', 'Advanced', 'Solves complex problems by breaking them into overlapping subproblems, storing each answer, and reusing it instead of repeating work.', dynamicProgramming, ['function fib(n) {', '  if (n <= 1) return n;', '  if (memo[n]) return memo[n];', '  memo[n] = fib(n - 1) + fib(n - 2);', '  return memo[n];', '}'], 'What makes Dynamic Programming efficient?', ['Random choices', 'Storing and reusing subproblem answers', 'Sorting first', 'Using more loops'], 1, 'DP avoids repeated work by saving answers to overlapping subproblems.', { best: 'O(n)', average: 'O(n)', worst: 'O(n)' }, 'O(n)'),
  techniqueAlgorithm('greedy-algorithm', 'Greedy Algorithm', 'Intermediate', 'Makes the locally best choice at each step, hoping that a sequence of local choices produces a globally optimal solution.', greedyAlgorithm, ['function makeChange(amount, coins) {', '  const chosen = [];', '  for (let i = coins.length - 1; i >= 0; i--) {', '    while (amount >= coins[i]) {', '      amount -= coins[i];', '      chosen.push(coins[i]);', '    }', '  }', '}'], 'What does a Greedy Algorithm choose?', ['The locally best option', 'Every option', 'The worst option', 'A random option'], 0, 'Greedy methods commit to the best-looking choice available right now.', { best: 'O(n)', average: 'O(n)', worst: 'O(n)' }, 'O(1)'),
  techniqueAlgorithm('divide-and-conquer', 'Divide and Conquer', 'Intermediate', 'Breaks a problem into smaller subproblems, solves each smaller problem, then combines their results.', divideAndConquer, ['function solve(problem) {', '  if (isSmall(problem)) return solveDirectly(problem);', '  const parts = divide(problem);', '  const answers = parts.map(solve);', '  return combine(answers);', '}'], 'What are the three stages?', ['Pick, swap, stop', 'Divide, solve, combine', 'Hash, search, sort', 'Push, pop, peek'], 1, 'Divide and Conquer divides the problem, solves smaller pieces, and combines the answers.', { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' }, 'O(log n)'),
  techniqueAlgorithm('hashing', 'Hashing', 'Intermediate', 'Maps data to a fixed-size bucket using a hash function, allowing very fast average-case lookup, insertion, and deletion.', hashing, ['const table = new Map();', 'function insert(key, value) {', '  table.set(key, value);', '}', 'function find(key) {', '  return table.get(key);', '}'], 'What is the average lookup time in a hash table?', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 0, 'A good hash function places keys into buckets so lookup is constant time on average.', { best: 'O(1)', average: 'O(1)', worst: 'O(n)' }, 'O(n)'),
  techniqueAlgorithm('two-pointer', 'Two Pointer Technique', 'Intermediate', 'Uses two indexes to move through an array, often from opposite ends, reducing a nested search to a single pass.', twoPointer, ['let left = 0;', 'let right = arr.length - 1;', 'while (left < right) {', '  const sum = arr[left] + arr[right];', '  if (sum === target) return [left, right];', '  if (sum < target) left++;', '  else right--;', '}'], 'Where do the pointers begin in this example?', ['Both in the middle', 'One at each end', 'Both at index 0', 'Outside the array'], 1, 'Starting at opposite ends lets each pointer eliminate impossible pairs efficiently.', { best: 'O(n)', average: 'O(n)', worst: 'O(n)' }, 'O(1)'),
  techniqueAlgorithm('sliding-window', 'Sliding Window', 'Intermediate', 'Maintains a window of fixed or variable size over an array, updating the result as the window moves instead of recomputing it.', slidingWindow, ['let windowSum = 0;', 'for (let right = 0; right < arr.length; right++) {', '  windowSum += arr[right];', '  if (right >= size) windowSum -= arr[right - size];', '  best = Math.max(best, windowSum);', '}'], 'Why is Sliding Window faster than checking every range?', ['It skips all values', 'It reuses the previous window sum', 'It sorts the array', 'It uses recursion'], 1, 'Only the entering and leaving values change, so each window updates in constant time.', { best: 'O(n)', average: 'O(n)', worst: 'O(n)' }, 'O(1)'),
  techniqueAlgorithm('recursion', 'Recursion', 'Beginner', 'A function calls itself to solve smaller instances of the same problem until it reaches a base case.', recursion, ['function factorial(n) {', '  if (n === 1) return 1;', '  return n * factorial(n - 1);', '}'], 'What prevents infinite recursive calls?', ['A loop', 'A base case', 'A hash table', 'A pointer'], 1, 'The base case stops the calls when the smallest solvable input is reached.', { best: 'O(n)', average: 'O(n)', worst: 'O(n)' }, 'O(n)'),
];

export const algorithms: Algorithm[] = [
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting',
    difficulty: 'Beginner',
    description: 'Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The largest elements "bubble" to the end with each pass.',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    code: [
      'function bubbleSort(arr) {',
      '  const n = arr.length;',
      '  for (let i = 0; i < n - 1; i++) {',
      '    for (let j = 0; j < n - i - 1; j++) {',
      '      if (arr[j] > arr[j + 1]) {',
      '        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];',
      '      }',
      '    }',
      '    // last i elements are sorted',
      '    // if no swaps, already sorted',
      '  }',
      '  return arr;',
      '}',
    ],
    visualizer: 'array',
    run: bubbleSort,
    quiz: [
      {
        question: 'What is the worst-case time complexity of Bubble Sort?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
        answerIndex: 2,
        explanation: 'Bubble Sort uses nested loops, each iterating up to n, giving O(n²) in the worst case.',
      },
      {
        question: 'When does Bubble Sort achieve its best-case O(n) time?',
        options: ['When the array is reverse-sorted', 'When the array is already sorted', 'When all elements are equal', 'Never'],
        answerIndex: 1,
        explanation: 'If the array is already sorted, the optimized version detects no swaps in the first pass and exits early.',
      },
      {
        question: 'What is the space complexity of Bubble Sort?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
        answerIndex: 2,
        explanation: 'Bubble Sort is in-place — it only uses a constant amount of extra memory for swapping.',
      },
    ],
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'Sorting',
    difficulty: 'Beginner',
    description: 'Divides the array into sorted and unsorted portions. Repeatedly finds the minimum element in the unsorted portion and swaps it with the first unsorted element.',
    timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    code: [
      'function selectionSort(arr) {',
      '  const n = arr.length;',
      '  for (let i = 0; i < n - 1; i++) {',
      '    let minIdx = i;',
      '    for (let j = i + 1; j < n; j++) {',
      '      if (arr[j] < arr[minIdx]) minIdx = j;',
      '    }',
      '    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];',
      '    // index i is now sorted',
      '  }',
      '  return arr;',
      '}',
    ],
    visualizer: 'array',
    run: selectionSort,
    quiz: [
      {
        question: 'How many comparisons does Selection Sort always make?',
        options: ['n', 'n log n', 'n(n-1)/2', 'n²'],
        answerIndex: 2,
        explanation: 'Selection Sort always performs n(n-1)/2 comparisons regardless of input order.',
      },
      {
        question: 'What is the maximum number of swaps Selection Sort performs?',
        options: ['n', 'n-1', 'n²', 'n log n'],
        answerIndex: 1,
        explanation: 'Selection Sort performs at most n-1 swaps — one per pass.',
      },
      {
        question: 'Is Selection Sort stable?',
        options: ['Yes', 'No', 'Only for sorted input', 'Only for small arrays'],
        answerIndex: 1,
        explanation: 'Selection Sort is not stable because swapping can change the relative order of equal elements.',
      },
    ],
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'Sorting',
    difficulty: 'Beginner',
    description: 'Builds the sorted array one element at a time by taking each element and inserting it into its correct position among previously sorted elements.',
    timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    code: [
      'function insertionSort(arr) {',
      '  for (let i = 1; i < arr.length; i++) {',
      '    let key = arr[i];',
      '    let j = i - 1;',
      '    while (j >= 0 && arr[j] > key) {',
      '      arr[j + 1] = arr[j];',
      '      j--;',
      '    }',
      '    arr[j + 1] = key;',
      '  }',
      '  return arr;',
      '}',
    ],
    visualizer: 'array',
    run: insertionSort,
    quiz: [
      {
        question: 'When is Insertion Sort most efficient?',
        options: ['Large random arrays', 'Nearly sorted arrays', 'Reverse-sorted arrays', 'Arrays with all duplicates'],
        answerIndex: 1,
        explanation: 'Insertion Sort runs in O(n) time on nearly sorted arrays because each element moves very little.',
      },
      {
        question: 'Is Insertion Sort stable?',
        options: ['Yes', 'No', 'Depends on implementation', 'Only for integers'],
        answerIndex: 0,
        explanation: 'Insertion Sort is stable — equal elements retain their relative order.',
      },
      {
        question: 'What is the worst-case time complexity of Insertion Sort?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'],
        answerIndex: 2,
        explanation: 'The worst case is a reverse-sorted array, where every element must shift all the way to the front.',
      },
    ],
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'Sorting',
    difficulty: 'Intermediate',
    description: 'A divide-and-conquer algorithm. Picks a pivot, partitions the array around it (smaller elements left, larger right), then recursively sorts each partition.',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(log n)',
    code: [
      'function quickSort(arr, low, high) {',
      '  if (low < high) {',
      '    const pi = partition(arr, low, high);',
      '    quickSort(arr, low, pi - 1);',
      '    quickSort(arr, pi + 1, high);',
      '  }',
      '}',
      'function partition(arr, low, high) {',
      '  const pivot = arr[high];',
      '  let i = low - 1;',
      '  for (let j = low; j < high; j++) {',
      '    if (arr[j] < pivot) {',
      '      i++;',
      '      [arr[i], arr[j]] = [arr[j], arr[i]];',
      '    }',
      '  }',
      '  [arr[i+1], arr[high]] = [arr[high], arr[i+1]];',
      '  return i + 1;',
      '}',
    ],
    visualizer: 'array',
    run: quickSort,
    quiz: [
      {
        question: 'What is the worst-case time complexity of Quick Sort?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        answerIndex: 2,
        explanation: 'The worst case O(n²) occurs when the pivot is always the smallest or largest element (e.g., already sorted with last-element pivot).',
      },
      {
        question: 'What is the space complexity of Quick Sort due to recursion?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
        answerIndex: 1,
        explanation: 'The recursion depth is O(log n) on average, giving O(log n) space for the call stack.',
      },
      {
        question: 'Which pivot selection strategy helps avoid worst-case behavior?',
        options: ['Always pick the first element', 'Always pick the last element', 'Random pivot or median-of-three', 'Pick the middle index always'],
        answerIndex: 2,
        explanation: 'Random pivot or median-of-three selection avoids systematic worst-case patterns on sorted or nearly-sorted data.',
      },
    ],
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'Sorting',
    difficulty: 'Intermediate',
    description: 'A stable divide-and-conquer algorithm. Recursively splits the array in half, sorts each half, then merges the sorted halves back together.',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    code: [
      'function mergeSort(arr, low, high) {',
      '  if (low < high) {',
      '    const mid = Math.floor((low + high) / 2);',
      '    mergeSort(arr, low, mid);',
      '    mergeSort(arr, mid + 1, high);',
      '    merge(arr, low, mid, high);',
      '  }',
      '}',
      'function merge(arr, low, mid, high) {',
      '  const left = arr.slice(low, mid+1);',
      '  const right = arr.slice(mid+1, high+1);',
      '  // merge left and right into arr',
      '  // ...',
      '}',
    ],
    visualizer: 'array',
    run: mergeSort,
    quiz: [
      {
        question: 'What is the time complexity of Merge Sort in all cases?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'Varies'],
        answerIndex: 1,
        explanation: 'Merge Sort always divides in half and merges in linear time, giving O(n log n) in all cases.',
      },
      {
        question: 'What is the space complexity of Merge Sort?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        answerIndex: 2,
        explanation: 'Merge Sort requires O(n) auxiliary space for the temporary arrays during merging.',
      },
      {
        question: 'Is Merge Sort stable?',
        options: ['Yes', 'No', 'Only for integers', 'Depends on merge logic'],
        answerIndex: 0,
        explanation: 'Merge Sort is stable — when merging, equal elements from the left half are placed first, preserving their order.',
      },
    ],
  },
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'Searching',
    difficulty: 'Beginner',
    description: 'The simplest search algorithm. Checks each element sequentially until the target is found or the list ends. Works on unsorted data.',
    timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    code: [
      'function linearSearch(arr, target) {',
      '  for (let i = 0; i < arr.length; i++) {',
      '    if (arr[i] === target) return i;',
      '  }',
      '  return -1;',
      '}',
    ],
    visualizer: 'array',
    run: linearSearch,
    quiz: [
      {
        question: 'What is the best-case time complexity of Linear Search?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        answerIndex: 0,
        explanation: 'If the target is the first element, Linear Search finds it immediately in O(1).',
      },
      {
        question: 'Does Linear Search require the array to be sorted?',
        options: ['Yes', 'No', 'Only for integers', 'Only for strings'],
        answerIndex: 1,
        explanation: 'Linear Search works on any array, sorted or unsorted — it checks every element.',
      },
      {
        question: 'What is the worst-case time complexity?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        answerIndex: 2,
        explanation: 'In the worst case, the target is at the end or not present, requiring n comparisons.',
      },
    ],
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Searching',
    difficulty: 'Intermediate',
    description: 'A fast search on sorted arrays. Repeatedly divides the search range in half, comparing the middle element to the target and eliminating half the remaining elements.',
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)',
    code: [
      'function binarySearch(arr, target) {',
      '  let lo = 0, hi = arr.length - 1;',
      '  while (lo <= hi) {',
      '    const mid = Math.floor((lo + hi) / 2);',
      '    if (arr[mid] === target) return mid;',
      '    if (arr[mid] < target) lo = mid + 1;',
      '    else hi = mid - 1;',
      '  }',
      '  return -1;',
      '}',
    ],
    visualizer: 'array',
    run: binarySearch,
    quiz: [
      {
        question: 'What precondition does Binary Search require?',
        options: ['The array must be sorted', 'The array must have even length', 'The array must contain unique elements', 'No precondition'],
        answerIndex: 0,
        explanation: 'Binary Search only works on sorted arrays — it relies on ordering to eliminate half the elements.',
      },
      {
        question: 'What is the time complexity of Binary Search?',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        answerIndex: 1,
        explanation: 'Each comparison halves the search space, giving O(log n) time.',
      },
      {
        question: 'What happens if you run Binary Search on an unsorted array?',
        options: ['It still works correctly', 'Results are unpredictable', 'It crashes', 'It returns -1 always'],
        answerIndex: 1,
        explanation: 'Without sorting, the half-elimination logic is invalid, so the result may be incorrect.',
      },
    ],
  },
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    category: 'Graph',
    difficulty: 'Intermediate',
    description: 'Explores a graph level by level using a queue. Starting from a source node, it visits all immediate neighbors first, then their neighbors, and so on. Guarantees the shortest path in unweighted graphs.',
    timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
    spaceComplexity: 'O(V)',
    code: [
      'function bfs(graph, start) {',
      '  const visited = new Set([start]);',
      '  const queue = [start];',
      '  while (queue.length) {',
      '    const node = queue.shift();',
      '    for (const neighbor of graph[node]) {',
      '      if (!visited.has(neighbor)) {',
      '        visited.add(neighbor);',
      '        queue.push(neighbor);',
      '      }',
      '    }',
      '  }',
      '}',
    ],
    visualizer: 'graph',
    graphData: sampleGraph,
    runGraph: bfsSteps,
    quiz: [
      {
        question: 'What data structure does BFS use to track nodes to visit?',
        options: ['Stack', 'Queue', 'Priority Queue', 'Hash Map'],
        answerIndex: 1,
        explanation: 'BFS uses a queue (FIFO) to ensure nodes are visited in the order they were discovered, giving level-by-level traversal.',
      },
      {
        question: 'What is the time complexity of BFS?',
        options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V * E)'],
        answerIndex: 2,
        explanation: 'BFS visits each vertex once (O(V)) and examines each edge once (O(E)), giving O(V + E).',
      },
      {
        question: 'BFS guarantees the shortest path in which type of graph?',
        options: ['Weighted graphs', 'Unweighted graphs', 'Directed graphs', 'All graphs'],
        answerIndex: 1,
        explanation: 'In unweighted graphs, BFS finds the shortest path because it explores nodes in order of distance from the source.',
      },
    ],
  },
  {
    id: 'dfs',
    name: 'Depth-First Search',
    category: 'Graph',
    difficulty: 'Intermediate',
    description: 'Explores as deep as possible along each branch before backtracking. Uses a stack (or recursion) to go deep first. Useful for cycle detection, topological sorting, and maze solving.',
    timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
    spaceComplexity: 'O(V)',
    code: [
      'function dfs(graph, node, visited) {',
      '  visited.add(node);',
      '  for (const neighbor of graph[node]) {',
      '    if (!visited.has(neighbor)) {',
      '      dfs(graph, neighbor, visited);',
      '    }',
      '  }',
      '}',
    ],
    visualizer: 'graph',
    graphData: sampleGraph,
    runGraph: dfsSteps,
    quiz: [
      {
        question: 'What data structure does DFS use implicitly via recursion?',
        options: ['Queue', 'Stack', 'Linked List', 'Tree'],
        answerIndex: 1,
        explanation: 'DFS uses a stack (LIFO) — recursion uses the call stack, which gives the last-in-first-out behavior DFS needs.',
      },
      {
        question: 'Which problem is DFS better suited for than BFS?',
        options: ['Shortest path in unweighted graphs', 'Cycle detection & topological sort', 'Level-order traversal', 'Finding minimum spanning tree'],
        answerIndex: 1,
        explanation: 'DFS is better for cycle detection, topological sorting, and finding connected components.',
      },
      {
        question: 'What is the time complexity of DFS?',
        options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V²)'],
        answerIndex: 2,
        explanation: 'Like BFS, DFS visits each vertex once and examines each edge once, giving O(V + E).',
      },
    ],
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'Graph',
    difficulty: 'Advanced',
    description: 'Finds the shortest path from a source node to all other nodes in a weighted graph with non-negative weights. Uses a distance table and greedily selects the closest unvisited node at each step.',
    timeComplexity: { best: 'O(V²)', average: 'O((V + E) log V)', worst: 'O((V + E) log V)' },
    spaceComplexity: 'O(V)',
    code: [
      'function dijkstra(graph, source) {',
      '  const dist = {}; dist[source] = 0;',
      '  const visited = new Set();',
      '  while (true) {',
      '    // pick min-distance unvisited node',
      '    const u = pickMin(dist, visited);',
      '    if (!u) break;',
      '    visited.add(u);',
      '    for (const {to, w} of graph[u]) {',
      '      if (dist[u] + w < dist[to]) {',
      '        dist[to] = dist[u] + w;',
      '      }',
      '    }',
      '  }',
      '}',
    ],
    visualizer: 'graph',
    graphData: sampleGraph,
    runGraph: dijkstraSteps,
    quiz: [
      {
        question: "What does Dijkstra's algorithm compute?",
        options: ['Minimum spanning tree', 'Shortest paths from a source to all nodes', 'Maximum flow', 'Strongly connected components'],
        answerIndex: 1,
        explanation: "Dijkstra's algorithm finds the shortest path from a source node to every other node in a weighted graph.",
      },
      {
        question: "Dijkstra's algorithm fails when edge weights are:",
        options: ['All zero', 'Negative', 'Very large', 'Floating point'],
        answerIndex: 1,
        explanation: 'Dijkstra assumes all weights are non-negative. Negative weights can cause it to skip a shorter path through a negative-weight edge.',
      },
      {
        question: 'What data structure optimizes Dijkstra to O((V+E) log V)?',
        options: ['Sorted array', 'Hash map', 'Min-heap (priority queue)', 'Binary search tree'],
        answerIndex: 2,
        explanation: 'A min-heap priority queue allows extracting the minimum-distance node in O(log V) and updating distances efficiently.',
      },
    ],
  },
  ...techniqueAlgorithms,
];
