import Chart from "https://cdn.jsdelivr.net/npm/chart.js/auto/+esm";

(() => {

console.log("tuningcurve.js loaded");

const CONFIG = [
    {
        canvas: "unit870",
        file: "data/870.json"
    },
    {
        canvas: "unit787",
        file: "data/787.json"
    },
    {
        canvas: "unit970",
        file: "data/970.json"
    },
    {
        canvas: "unit890",
        file: "data/890.json"
    }
];

const charts = [];
const datasets = [];

// ------------------------------------------------------------
// Load all JSON files
// ------------------------------------------------------------

async function loadData() {

    const promises = CONFIG.map(async cfg => {

        const response = await fetch(cfg.file);

        if (!response.ok)
            throw new Error(`Could not load ${cfg.file}`);

        return await response.json();
    });

    return Promise.all(promises);

}

// ------------------------------------------------------------

function makeScatter(unit) {

    const scatter = [];

    unit.angles_deg.forEach((angle, i) => {

        unit.trial_firing_rates[i].forEach(rate => {

            scatter.push({
                x: angle,
                y: rate
            });

        });

    });

    return scatter;

}

// ------------------------------------------------------------

function makeMean(unit) {

    return unit.angles_deg.map((angle, i) => ({

        x: angle,
        y: unit.mean_firing_rate[i]

    }));

}

// ------------------------------------------------------------

function createChart(canvasId, unit) {

    const ctx = document.getElementById(canvasId);

    const chart = new Chart(ctx, {

        type: "scatter",

        data: {

            datasets: [

                // Trial points
                {
                    type: "scatter",

                    data: [],

                    pointRadius: 4,

                    pointBackgroundColor: "rgba(70,130,180,0.35)",

                    pointBorderWidth: 0
                },

                // Mean line
                {
                    type: "line",

                    data: [],

                    borderColor: "#3776ab",

                    borderWidth: 3,

                    pointRadius: 5,

                    pointBackgroundColor: "#3776ab",

                    fill: false,

                    tension: 0
                }

            ]

        },

        options: {

            responsive: true,
            maintainAspectRatio: false,

            animation: {
                duration: 700
            },


            plugins: {

                legend: {

                    display: false

                },

                title: {

                    display: true,

                    text: `Unit ${unit.channel}`

                }

            },

            scales: {

                x: {

                    type: "linear",

                    min: 0,

                    max: 360,

                    ticks: {

                        stepSize: 45

                    },

                    title: {

                        display: true,

                        text: "Direction (°)"

                    }

                },

                y: {

                    title: {

                        display: true,

                        text: "Firing Rate (Hz)"

                    }

                }

            }

        }

    });

    charts.push(chart);

    datasets.push({

        scatter: makeScatter(unit),

        mean: makeMean(unit)

    });

}

// ------------------------------------------------------------

function showScatter() {

    charts.forEach((chart, i) => {

        chart.data.datasets[0].data = datasets[i].scatter;

        chart.update();

    });

}

// ------------------------------------------------------------

function hideScatter() {

    charts.forEach(chart => {

        chart.data.datasets[0].data = [];

        chart.update();

    });

}

// ------------------------------------------------------------

function showMean() {

    charts.forEach((chart, i) => {

        chart.data.datasets[1].data = datasets[i].mean;

        chart.update();

    });

}

// ------------------------------------------------------------

function hideMean() {

    charts.forEach(chart => {

        chart.data.datasets[1].data = [];

        chart.update();

    });

}

// ------------------------------------------------------------

function setupReveal() {

    if (typeof Reveal === "undefined")
        return;

    Reveal.on("fragmentshown", e => {

        if (e.fragment.id === "show-scatter")
            showScatter();

        if (e.fragment.id === "show-mean")
            showMean();

    });

    Reveal.on("fragmenthidden", e => {

        if (e.fragment.id === "show-scatter")
            hideScatter();

        if (e.fragment.id === "show-mean")
            hideMean();

    });

}

// ------------------------------------------------------------

window.addEventListener("load", async () => {

    const units = await loadData();

    CONFIG.forEach((cfg, i) => {

        createChart(cfg.canvas, units[i]);

    });

    setupReveal();

});

})();