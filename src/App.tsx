import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, RotateCcw,
  Code2, Brain, BookOpen, CheckCircle2, Clock, Zap, Database,
  ChevronRight, GraduationCap, Layers, Search, BarChart3, Network, Lightbulb,
} from 'lucide-react';
import { algorithms } from '@/lib/algorithms';
import type { Algorithm, Step, GraphStep } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import ArrayVisualizer from '@/components/ArrayVisualizer';
import GraphVisualizer from '@/components/GraphVisualizer';
import CodeDisplay from '@/components/CodeDisplay';
import Quiz from '@/components/Quiz';
import ComplexityChart from '@/components/ComplexityChart';

type View = 'learn' | 'quiz';
type ProgressStatus = 'not-started' | 'in-progress' | 'completed';

interface ProgressRecord {
  id: string;
  algorithm_id: string;
  status: ProgressStatus;
  best_score: number | null;
  attempts: number;
  last_visited_at: string | null;
}

const categoryIcons: Record<string, typeof Code2> = {
  Sorting: BarChart3,
  Searching: Search,
  Graph: Network,
  Techniques: Lightbulb,
};

const difficultyColors: Record<string, string> = {
  Beginner: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  Intermediate: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  Advanced: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
};

function generateArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
}

export default function App() {
  const [selectedAlgo, setSelectedAlgo] = useState<Algorithm>(algorithms[0]);
  const [inputArray, setInputArray] = useState<number[]>(generateArray(10));
  const [arraySteps, setArraySteps] = useState<Step[]>([]);
  const [graphSteps, setGraphSteps] = useState<GraphStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [view, setView] = useState<View>('learn');
  const [progress, setProgress] = useState<Record<string, ProgressRecord>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isGraph = selectedAlgo.visualizer === 'graph';
  const totalSteps = isGraph ? graphSteps.length : arraySteps.length;
  const maxValue = Math.max(...inputArray, 1);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('algorithm_progress').select('*');
        if (data) {
          const map: Record<string, ProgressRecord> = {};
          data.forEach((r: ProgressRecord) => { map[r.algorithm_id] = r; });
          setProgress(map);
        }
      } catch (err) {
        console.warn('Could not fetch progress from Supabase:', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (isGraph) {
      const generated = selectedAlgo.runGraph ? selectedAlgo.runGraph() : [];
      setGraphSteps(generated);
      setArraySteps([]);
    } else {
      const generated = selectedAlgo.run ? selectedAlgo.run(inputArray) : [];
      setArraySteps(generated);
      setGraphSteps([]);
    }
    setCurrentStep(0);
    setIsPlaying(false);
  }, [selectedAlgo, inputArray, isGraph]);

  const updateVisitProgress = useCallback(async (algoId: string) => {
    const existing = progress[algoId];
    const now = new Date().toISOString();
    if (existing) {
      setProgress((prev) => ({
        ...prev,
        [algoId]: { ...prev[algoId], status: 'in-progress' as ProgressStatus, last_visited_at: now },
      }));
      try {
        await supabase
          .from('algorithm_progress')
          .update({ status: 'in-progress' as ProgressStatus, last_visited_at: now, updated_at: now })
          .eq('id', existing.id);
      } catch (err) {
        console.warn('Error updating progress:', err);
      }
    } else {
      const tempRecord: ProgressRecord = {
        id: 'local_' + Date.now(),
        algorithm_id: algoId,
        status: 'in-progress',
        best_score: null,
        attempts: 0,
        last_visited_at: now,
      };
      setProgress((prev) => ({ ...prev, [algoId]: tempRecord }));
      try {
        const { data } = await supabase
          .from('algorithm_progress')
          .insert({ algorithm_id: algoId, status: 'in-progress' as ProgressStatus, last_visited_at: now })
          .select()
          .single();
        if (data) {
          setProgress((prev) => ({ ...prev, [algoId]: data as ProgressRecord }));
        }
      } catch (err) {
        console.warn('Error inserting progress:', err);
      }
    }
  }, [progress]);

  useEffect(() => {
    updateVisitProgress(selectedAlgo.id);
  }, [selectedAlgo.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isPlaying && currentStep < totalSteps - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentStep((s) => s + 1);
      }, speed);
    } else if (currentStep >= totalSteps - 1 && totalSteps > 0) {
      setIsPlaying(false);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, currentStep, totalSteps, speed]);

  const handleSelectAlgo = (algo: Algorithm) => {
    setSelectedAlgo(algo);
    setView('learn');
    setSidebarOpen(false);
  };

  const handleNewArray = () => {
    setInputArray(generateArray(10));
  };

  const handleStepForward = () => {
    if (currentStep < totalSteps - 1) setCurrentStep((s) => s + 1);
  };

  const handleStepBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (currentStep >= totalSteps - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  };

  const handleQuizComplete = async (score: number) => {
    const existing = progress[selectedAlgo.id];
    const newStatus: ProgressStatus = score >= 67 ? 'completed' : 'in-progress';
    const now = new Date().toISOString();

    if (existing) {
      const bestScore = existing.best_score == null ? score : Math.max(existing.best_score, score);
      setProgress((prev) => ({
        ...prev,
        [selectedAlgo.id]: {
          ...prev[selectedAlgo.id],
          status: newStatus,
          best_score: bestScore,
          attempts: existing.attempts + 1,
        },
      }));
      try {
        await supabase
          .from('algorithm_progress')
          .update({
            status: newStatus,
            best_score: bestScore,
            attempts: existing.attempts + 1,
            updated_at: now,
          })
          .eq('id', existing.id);
      } catch (err) {
        console.warn('Error updating quiz score:', err);
      }
    } else {
      const tempRecord: ProgressRecord = {
        id: 'local_' + Date.now(),
        algorithm_id: selectedAlgo.id,
        status: newStatus,
        best_score: score,
        attempts: 1,
        last_visited_at: now,
      };
      setProgress((prev) => ({ ...prev, [selectedAlgo.id]: tempRecord }));
      try {
        const { data } = await supabase
          .from('algorithm_progress')
          .insert({
            algorithm_id: selectedAlgo.id,
            status: newStatus,
            best_score: score,
            attempts: 1,
          })
          .select()
          .single();
        if (data) {
          setProgress((prev) => ({ ...prev, [selectedAlgo.id]: data as ProgressRecord }));
        }
      } catch (err) {
        console.warn('Error inserting quiz score:', err);
      }
    }
  };

  const currentArrayStep = arraySteps[currentStep];
  const currentGraphStep = graphSteps[currentStep];
  const currentDescription = isGraph ? currentGraphStep?.description : currentArrayStep?.description;
  const currentCodeLine = isGraph ? currentGraphStep?.codeLine : currentArrayStep?.codeLine;

  const completedCount = Object.values(progress).filter((p) => p.status === 'completed').length;
  const inProgressCount = Object.values(progress).filter((p) => p.status === 'in-progress').length;

  // Legend items depend on visualizer type
  const arrayLegend = [
    { label: 'Comparing', color: 'bg-amber-500', desc: 'Two elements being compared' },
    { label: 'Swapping', color: 'bg-rose-500', desc: 'Elements being swapped' },
    { label: 'Sorted', color: 'bg-emerald-500', desc: 'In final sorted position' },
    { label: 'Pivot', color: 'bg-violet-500', desc: 'Pivot element' },
    { label: 'Highlight', color: 'bg-sky-500', desc: 'Active search range' },
    { label: 'Idle', color: 'bg-slate-700', desc: 'Not yet processed' },
  ];

  const graphLegend = [
    { label: 'Start', color: 'bg-teal-500', desc: 'Starting node' },
    { label: 'Target', color: 'bg-rose-500', desc: 'Target node (Dijkstra)' },
    { label: 'Current', color: 'bg-sky-500', desc: 'Currently processing' },
    { label: 'Frontier', color: 'bg-amber-400', desc: 'Discovered, in queue/stack' },
    { label: 'Visited', color: 'bg-emerald-600', desc: 'Fully explored' },
    { label: 'Path', color: 'bg-violet-500', desc: 'Shortest path result' },
  ];

  const legend = isGraph ? graphLegend : arrayLegend;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 leading-tight">AlgoLearn</h1>
              <p className="text-xs text-slate-500">Interactive Algorithms</p>
            </div>
          </div>
        </div>

        {/* Progress summary */}
        <div className="px-5 py-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-300">Your Progress</span>
            <span className="text-xs text-slate-500">{completedCount}/{algorithms.length} done</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
            <div
              className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / algorithms.length) * 100}%` }}
            />
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {completedCount} completed
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {inProgressCount} in progress
            </span>
          </div>
        </div>

        {/* Algorithm list grouped by category */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {['Sorting', 'Searching', 'Graph', 'Techniques'].map((cat) => {
            const catAlgos = algorithms.filter((a) => a.category === cat);
            if (catAlgos.length === 0) return null;
            return (
              <div key={cat} className="mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">{cat}</p>
                {catAlgos.map((algo) => {
                  const algoProgress = progress[algo.id];
                  const Icon = categoryIcons[algo.category] || Code2;
                  const isActive = selectedAlgo.id === algo.id;
                  const status = algoProgress?.status;
                  return (
                    <button
                      key={algo.id}
                      onClick={() => handleSelectAlgo(algo)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
                        isActive
                          ? 'bg-sky-500/10 border border-sky-500/30'
                          : 'hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'bg-sky-500' : 'bg-slate-800'
                      }`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <span className={`text-sm font-medium block truncate ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>
                          {algo.name}
                        </span>
                        <span className="text-xs text-slate-500">{algo.difficulty}</span>
                      </div>
                      {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                      {status === 'in-progress' && <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-800"
            >
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">{selectedAlgo.name}</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColors[selectedAlgo.difficulty]}`}>
                  {selectedAlgo.difficulty}
                </span>
              </div>
              <p className="text-sm text-slate-500">{selectedAlgo.category}</p>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setView('learn')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'learn' ? 'bg-slate-700 text-slate-100 shadow-sm' : 'text-slate-400'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Learn</span>
            </button>
            <button
              onClick={() => setView('quiz')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'quiz' ? 'bg-slate-700 text-slate-100 shadow-sm' : 'text-slate-400'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Quiz</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {view === 'learn' ? (
            <div className="max-w-6xl mx-auto flex flex-col gap-6">
              {/* Description */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <p className="text-slate-400 leading-relaxed">{selectedAlgo.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-slate-500 font-medium">Best Case</span>
                    <span className="text-sm font-semibold text-emerald-400 font-mono">{selectedAlgo.timeComplexity.best}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-slate-500 font-medium">Average</span>
                    <span className="text-sm font-semibold text-amber-400 font-mono">{selectedAlgo.timeComplexity.average}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-slate-500 font-medium">Worst Case</span>
                    <span className="text-sm font-semibold text-rose-400 font-mono">{selectedAlgo.timeComplexity.worst}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-slate-500 font-medium">Space</span>
                    <span className="text-sm font-semibold text-sky-400 font-mono">{selectedAlgo.spaceComplexity}</span>
                  </div>
                </div>
              </div>

              {/* Visualizer — full width, the main attraction */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                    {isGraph ? (
                      <Network className="w-5 h-5 text-violet-400" />
                    ) : (
                      <BarChart3 className="w-5 h-5 text-sky-400" />
                    )}
                    Visualization
                  </h3>
                  {!isGraph && (
                    <button
                      onClick={handleNewArray}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      New Array
                    </button>
                  )}
                </div>

                {/* The visualizer itself — large */}
                <div className="flex-1 flex items-center justify-center bg-slate-950 rounded-xl p-6 min-h-[460px] border border-slate-800">
                  {isGraph ? (
                    currentGraphStep && <GraphVisualizer step={currentGraphStep} />
                  ) : (
                    currentArrayStep && <ArrayVisualizer step={currentArrayStep} maxValue={maxValue} />
                  )}
                </div>

                {/* Step info */}
                <div className="mt-4 bg-slate-950 rounded-lg p-4 min-h-[64px] border border-slate-800">
                  <p className="text-base text-slate-300">
                    {currentDescription || 'Ready to start.'}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mt-4 gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleStepBack}
                      disabled={currentStep === 0}
                      className="p-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <SkipBack className="w-5 h-5 text-slate-400" />
                    </button>
                    <button
                      onClick={handlePlayPause}
                      className="p-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-white transition-colors shadow-lg shadow-sky-500/20"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={handleStepForward}
                      disabled={currentStep >= totalSteps - 1}
                      className="p-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <SkipForward className="w-5 h-5 text-slate-400" />
                    </button>
                    <button
                      onClick={handleReset}
                      className="p-2.5 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-slate-500 hidden sm:inline">Speed</span>
                    <input
                      type="range"
                      min="100"
                      max="1500"
                      step="100"
                      value={1700 - speed}
                      onChange={(e) => setSpeed(1700 - Number(e.target.value))}
                      className="w-28 accent-sky-500"
                    />
                  </div>
                </div>

                {/* Step counter + stats */}
                <div className="flex items-center justify-between mt-3 text-sm text-slate-500">
                  <span>Step <span className="font-semibold text-slate-300">{currentStep + 1}</span> / {totalSteps || 1}</span>
                  {!isGraph && (
                    <div className="flex gap-4">
                      <span>Comparisons: <span className="font-semibold text-amber-400">{currentArrayStep?.comparisons ?? 0}</span></span>
                      <span>Swaps: <span className="font-semibold text-rose-400">{currentArrayStep?.swaps ?? 0}</span></span>
                    </div>
                  )}
                  {isGraph && currentGraphStep?.queue != null && (
                    <span>Queue size: <span className="font-semibold text-sky-400">{currentGraphStep.queue.length}</span></span>
                  )}
                  {isGraph && currentGraphStep?.stack != null && (
                    <span>Stack size: <span className="font-semibold text-sky-400">{currentGraphStep.stack.length}</span></span>
                  )}
                  {isGraph && currentGraphStep?.distances && (
                    <span>Path: <span className="font-semibold text-violet-400">{currentGraphStep.metricValue}</span></span>
                  )}
                </div>
              </div>

              {/* Code + Legend side by side, below visualizer */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Code display — takes 2 columns */}
                <div className="lg:col-span-2 flex flex-col">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2 mb-4">
                    <Code2 className="w-4 h-4 text-sky-400" />
                    Code Walkthrough
                  </h3>
                  <CodeDisplay algorithm={selectedAlgo} currentLine={currentCodeLine} />
                </div>

                {/* Legend — takes 1 column */}
                <div className="flex flex-col gap-6">
                  <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                    <h3 className="font-semibold text-slate-200 flex items-center gap-2 mb-4">
                      <Layers className="w-4 h-4 text-sky-400" />
                      Color Legend
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {legend.map((item) => (
                        <div key={item.label} className="flex items-start gap-2.5">
                          <div className={`w-3.5 h-3.5 rounded mt-0.5 flex-shrink-0 ${item.color}`} />
                          <div>
                            <span className="text-sm font-medium text-slate-300 block">{item.label}</span>
                            <span className="text-xs text-slate-500">{item.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bar graph comparison — full width */}
              <ComplexityChart />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100">{selectedAlgo.name} Quiz</h3>
                    <p className="text-sm text-slate-500">Test your understanding</p>
                  </div>
                </div>
                <Quiz algorithm={selectedAlgo} onComplete={handleQuizComplete} />
              </div>

              {/* Past attempts */}
              {progress[selectedAlgo.id] && (
                <div className="mt-4 bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <h4 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4 text-slate-500" />
                    Your History
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-xs text-slate-500">Attempts</span>
                      <p className="text-lg font-bold text-slate-200">{progress[selectedAlgo.id].attempts}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Best Score</span>
                      <p className="text-lg font-bold text-slate-200">
                        {progress[selectedAlgo.id].best_score != null ? `${progress[selectedAlgo.id].best_score}%` : '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Status</span>
                      <p className="text-lg font-bold capitalize">
                        {progress[selectedAlgo.id].status === 'completed' ? (
                          <span className="text-emerald-400">Completed</span>
                        ) : progress[selectedAlgo.id].status === 'in-progress' ? (
                          <span className="text-amber-400">In Progress</span>
                        ) : (
                          <span className="text-slate-500">Not Started</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
