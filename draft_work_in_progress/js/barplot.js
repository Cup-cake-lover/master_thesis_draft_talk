(() => {

console.log("barplot.js loaded");

let chart;
let data;

// --------------------------------------------------
// Load data
// --------------------------------------------------

async function loadData() {

    const res = await fetch("data/bar.json");

    if (!res.ok) {
        throw new Error("Failed to load bar.json");
    }

    return await res.json();
}

// --------------------------------------------------
// Init chart
// --------------------------------------------------

function initChart(d) {

    const dom = document.getElementById("barplot");
    if (!dom) return;

    chart = echarts.init(dom);

    chart.setOption({
        color: [
        "#5470C6", // <1 ms
        "#91CC75", // <2 ms
        "#EE6666"  // <5 ms
        ],

        animationDuration: 600,

        xAxis: {
            type: "category",
            data: d.recordings
        },

        yAxis: {
            type: "value"
        },

        series: [
            { name: "<1ms", type: "bar", data: [] },
            { name: "<2ms", type: "bar", data: [] },
            { name: "<5ms", type: "bar", data: [] }
        ]
    });
}

// --------------------------------------------------
// Reveal states
// --------------------------------------------------

function showPartial(level) {

    chart.setOption({
        series: [
            { data: level >= 1 ? data.lt1 : [] },
            { data: level >= 2 ? data.lt2 : [] },
            { data: level >= 3 ? data.lt5 : [] }
        ]
    });
}

// --------------------------------------------------
// Reveal.js integration (stepped reveal)
// --------------------------------------------------

function setupReveal() {

    if (typeof Reveal === "undefined") return;

    Reveal.on("fragmentshown", (event) => {

        const id = event.fragment.id;

        if (id === "bar-reveal-1") showPartial(1);
        if (id === "bar-reveal-2") showPartial(2);
        if (id === "bar-reveal-3") showPartial(3);
    });

    Reveal.on("fragmenthidden", (event) => {

        const id = event.fragment.id;

        if (id === "bar-reveal-1") showPartial(0);
        if (id === "bar-reveal-2") showPartial(1);
        if (id === "bar-reveal-3") showPartial(2);
    });
}

// --------------------------------------------------
// Main
// --------------------------------------------------

window.addEventListener("load", async () => {

    data = await loadData();

    initChart(data);

    setupReveal();
});

})();