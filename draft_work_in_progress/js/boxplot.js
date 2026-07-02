console.log("boxplot.js loaded");

let chart;

let labels = [];
let rawData = [];
let boxData = [];

// --------------------------------------------------
// Load JSON
// --------------------------------------------------

async function loadData() {

    const res = await fetch("data/trials.json");

    if (!res.ok) {
        throw new Error("Failed to load trials.json");
    }

    const json = await res.json();

    labels = Object.keys(json);
    rawData = Object.values(json);
}

// --------------------------------------------------
// Statistics (boxplot computation)
// --------------------------------------------------

function percentile(sorted, p) {
    const i = (sorted.length - 1) * p;
    const lo = Math.floor(i);
    const hi = Math.ceil(i);

    if (lo === hi) return sorted[lo];

    return sorted[lo] + (i - lo) * (sorted[hi] - sorted[lo]);
}

function computeBoxData(data) {

    return data.map(values => {

        const s = [...values].sort((a, b) => a - b);

        return [
            s[0],                 // min
            percentile(s, 0.25),  // Q1
            percentile(s, 0.50),  // median
            percentile(s, 0.75),  // Q3
            s[s.length - 1]       // max
        ];
    });
}

// --------------------------------------------------
// Chart init (AXES ONLY)
// --------------------------------------------------
// --------------------------------------------------
// Y-axis bounds from raw data
// --------------------------------------------------

function dataRange(data) {
    const all = data.flat();
    const min = Math.min(...all);
    const max = Math.max(...all);
    const pad = (max - min) * 0.05;   // 5% padding
    return { min: min - pad, max: max + pad };
}

function initChart() {

    const dom = document.getElementById("boxplot");

    if (!dom) {
        console.error("Missing #boxplot div");
        return;
    }

    chart = echarts.init(dom);

    chart.setOption({

        animationDuration: 600,

        xAxis: {
            type: "category",
            data: labels,
            name: "Trial"
        },

        yAxis: {
            type: "value",
            name: "Value",
            ...dataRange(rawData[0])   // spreads in min and max
        },

        series: [
            {
                type: "boxplot",
                data: [],   // 👈 start EMPTY (axes only)

                itemStyle: {
                    color: "#D4C2FC",
                    borderColor: "#333",
                    borderWidth: 2
                }
            }
        ]
    });
}

// --------------------------------------------------
// Reveal control
// --------------------------------------------------

function showBoxes() {

    chart.setOption({
        series: [
            {
                data: boxData
            }
        ]
    });
}

function hideBoxes() {

    chart.setOption({
        series: [
            {
                data: []
            }
        ]
    });
}

// --------------------------------------------------
// Reveal.js hooks
// --------------------------------------------------

function setupReveal() {

    if (typeof Reveal === "undefined") return;

    Reveal.on("fragmentshown", (event) => {

        if (event.fragment.id === "show-boxes") {
            showBoxes();
        }

    });

    Reveal.on("fragmenthidden", (event) => {

        if (event.fragment.id === "show-boxes") {
            hideBoxes();
        }

    });
}


// --------------------------------------------------
// Main
// --------------------------------------------------

window.addEventListener("load", async () => {

    await loadData();

    boxData = computeBoxData(rawData);

    initChart();

    setupReveal();
});