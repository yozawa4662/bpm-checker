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

const debugInfo = document.querySelector<HTMLDivElement>('#debug-info')!;
const debugButtonStates = document.querySelector<HTMLDivElement>('#debug-button-states')!;
const debugGamepadStatus = document.querySelector<HTMLDivElement>('#debug-gamepad-status')!;

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
const previousGamepadState: boolean[] = [];
let recentIntervals: number[] = [];
let startTime: number | null = null;
let totalDurationCount = 0;

/*
** Functions
*/
const fixed1 = (num: number) => num.toFixed(1);

const handleInput = () => {
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

const updateGamepad = () => {
    const gamepads = navigator.getGamepads();

    gamepads[0]?.buttons.forEach((button, index) => {
        const isPressed = button.pressed;

        if (isPressed && !previousGamepadState[index]) {
            handleInput();
        }
        previousGamepadState[index] = isPressed;
    });

    requestAnimationFrame(updateGamepad);
};

// eslint-disable-line no-unused-vars
const updateGamepadDebug = () => {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0];

    if (gp) {
        debugGamepadStatus.textContent = `ID: ${gp.id}`;

        const states = gp.buttons.map((btn, idx) => {
            const color = btn.pressed ? 'yellow' : 'lime';
            const value = btn.value.toFixed(2);
            return `<div style="color: ${color}">Btn ${idx}: ${btn.pressed ? 'ON' : 'OFF'} (${value})</div>`;
        }).join('');

        debugButtonStates.innerHTML = states;
    } else {
        debugGamepadStatus.textContent = "No gamepad detected. Press any button.";
    }

    requestAnimationFrame(updateGamepadDebug);
};

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

window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    handleInput();
});

// tap event
window.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).tagName === 'SELECT'
        || (e.target as HTMLElement).tagName === 'BUTTON') return;

    handleInput();
});

// Gamepad
window.addEventListener("gamepadconnected", () => {
    console.log("Gamepad connected!");
    requestAnimationFrame(updateGamepad);
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

// Debug
if (new URLSearchParams(window.location.search).get('debug')) {
    debugInfo.style.display = 'block';
    requestAnimationFrame(updateGamepadDebug);
}

// Start gamepad polling immediately
requestAnimationFrame(updateGamepad);
