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
** States
*/
let lastKeyTime: number | null = null;
let mode: number = 4;
let maxBpm = 0;
let numSamples = 16;
let recentIntervals: number[] = [];
let startTime: number | null = null;
let totalKeyCount = 0;

/*
** Functions
*/
const fixed1 = (num: number) => num.toFixed(1);

const handleInput = (e) => {
    if (e.repeat) return;

    const now = performance.now();
    totalKeyCount++;

    if (startTime === null) {
        startTime = now;
    }

    // average bpm
    let overallAvgBpm = 0;
    if (totalKeyCount > 1 && startTime !== null) {
        const totalDurationMin = (now - startTime) / 60 / 1000;
        overallAvgBpm = (totalKeyCount / totalDurationMin) / mode;
    }

    // current bpm
    let currentBpm = 0;
    if (lastKeyTime !== null) {
        const interval = now - lastKeyTime;

        recentIntervals.push(interval);
        if (recentIntervals.length > numSamples) recentIntervals.shift();
        const avgInterval = recentIntervals.reduce((a, b) => a + b) / recentIntervals.length;
        currentBpm = (60 * 1000 / avgInterval) / mode;
    }

    // max bpm
    if (currentBpm > maxBpm) maxBpm = currentBpm;

    updateDisplay(currentBpm, overallAvgBpm);
    lastKeyTime = now;
}

const reset = () => {
    lastKeyTime = null;
    maxBpm = 0;
    recentIntervals = [];
    startTime = null;
    totalKeyCount = 0;
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
