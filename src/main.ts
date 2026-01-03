import './style.css'

/*
** DOM
*/
const avgDisplay = document.querySelector<HTMLDivElement>('#avg-display')!;
const bpmDisplay = document.querySelector<HTMLDivElement>('#bpm-display')!;
const modeSelect = document.querySelector<HTMLSelectElement>('#mode-select')!;
const peakDisplay = document.querySelector<HTMLSpanElement>('#peak-display')!;
const resetBtn = document.querySelector<HTMLButtonElement>('#reset-btn')!;
const samplingSelect = document.querySelector<HTMLSelectElement>('#sampling-select')!;

/*
** Consts
*/
const RESET_SECONDS = 1.2;
const INTERVAL = 100;

/*
** States
*/
let lastKeyTime: number | null = null;
let mode: number = 4;
let maxBpm = 0;
let numSamples = 16;
let recentIntervals: number[] = [];
let startTime: number | null = null;
let totalDurationCount = 0;

/*
** Functions
*/
const fixed1 = (num: number) => num.toFixed(1);

const handleInput = (e: KeyboardEvent | PointerEvent) => {
    if ('repeat' in e && e.repeat) return;

    const now = performance.now();

    // First keydown
    if (lastKeyTime === null) {
        lastKeyTime = now;
        startTime = now;
        totalDurationCount = 0;
        return;
    }

    totalDurationCount++;
    const interval = now - lastKeyTime;
    lastKeyTime = now;

    // Moving average
    recentIntervals.push(interval);
    if (recentIntervals.length > numSamples) recentIntervals.shift();
    const avgInterval = recentIntervals.reduce((a, b) => a + b) / recentIntervals.length;

    // Current BPM
    const currentBpm = (60 * 1000 / avgInterval) / mode;

    // Average
    let overallAvgBpm = 0;
    if (startTime !== null) {
        const totalDurationMin = (now - startTime) / 60 / 1000;
        overallAvgBpm = (totalDurationCount / totalDurationMin) / mode;
    }

    // Max BPM
    if (currentBpm > maxBpm) maxBpm = currentBpm;

    updateDisplay(currentBpm, overallAvgBpm);
}

const reset = () => {
    lastKeyTime = null;
    maxBpm = 0;
    recentIntervals = [];
    startTime = null;
    totalDurationCount = 0;
    updateDisplay(0, 0);
}

const updateDisplay = (currentBpm: number, avgBpm: number) => {
    avgDisplay.textContent = fixed1(avgBpm);
    bpmDisplay.textContent = fixed1(currentBpm);
    peakDisplay.textContent = fixed1(maxBpm);
}

/*
** Events
*/
modeSelect.addEventListener('change', () => {
    mode = Number(modeSelect.value);
    reset();
});

resetBtn.addEventListener('click', reset);

samplingSelect.addEventListener('change', () => {
    numSamples = Number(samplingSelect.value);
    if (recentIntervals.length > numSamples) {
        recentIntervals = recentIntervals.slice(-numSamples);
    }
});

window.addEventListener('keydown', (e) => handleInput(e));

// tap event
window.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).tagName === 'SELECT' || (e.target as HTMLElement).tagName === 'BUTTON') {
        return;
    }

    // キーボード入力と同じ計測ロジックを実行する
    handleInput(e);
});

// Timer
setInterval(() => {
    if (lastKeyTime !== null) {
        const idleTime = performance.now() - lastKeyTime;
        if (idleTime > RESET_SECONDS * 1000) {
            reset();
        }
    }
}, INTERVAL);
