// DOM Elements
const totalRevenueInput = document.getElementById('total-revenue');
const aovInput = document.getElementById('avg-order-value');
const lrrSlider = document.getElementById('lrr-slider');
const prrSlider = document.getElementById('prr-slider');

const tfValLrr = document.getElementById('val-lrr');
const tfValPrr = document.getElementById('val-prr');

const valProspects = document.getElementById('val-prospects');
const valLeads = document.getElementById('val-leads');
const valCustomers = document.getElementById('val-customers');

const fillLeads = document.getElementById('fill-leads');
const fillCustomers = document.getElementById('fill-customers');

const pctLeads = document.getElementById('pct-leads');
const pctCustomers = document.getElementById('pct-customers');

const chartArea = document.getElementById('chart-area');
const xAxisLabelsContainer = document.getElementById('x-axis-labels');
const gridLinesContainer = document.getElementById('grid-lines');
const tooltip = document.getElementById('chart-tooltip');
const tooltipMonth = document.getElementById('tt-month');
const tooltipStats = document.getElementById('tt-stats');

const MAX_MONTHS = 6;
let maxChartScale = 140; 

function formatPct(num) {
    return (num * 100).toFixed(2) + '%';
}

function calculateModel() {
    let rev = parseFloat(totalRevenueInput.value) || 0;
    let aov = parseFloat(aovInput.value) || 1;
    let lrr = parseFloat(lrrSlider.value) / 100;
    let prr = parseFloat(prrSlider.value) / 100;

    // Based on math: Customers = Rev/AOV. Leads = Customers / LRR. Prospects = Leads / PRR.
    let customers = Math.round(rev / aov);
    let leads = Math.round(customers / lrr);
    let prospects = Math.round(leads / prr);

    if(!isFinite(prospects)) prospects = 0;
    if(!isFinite(leads)) leads = 0;

    // Update slidet texts
    tfValLrr.innerText = formatPct(lrr);
    tfValPrr.innerText = formatPct(prr);

    // Update track fills
    document.getElementById('lrr-track').style.setProperty('--val', (lrrSlider.value) + '%');
    document.getElementById('prr-track').style.setProperty('--val', (prrSlider.value) + '%');

    // Update Summary Cards
    valProspects.innerText = prospects;
    valLeads.innerText = leads;
    valCustomers.innerText = customers;

    let leadsPct = prospects > 0 ? (leads / prospects) * 100 : 0;
    let custPct = prospects > 0 ? (customers / prospects) * 100 : 0;

    pctLeads.innerText = Math.round(leadsPct) + '%';
    pctCustomers.innerText = Math.round(custPct) + '%';

    fillLeads.style.width = leadsPct + '%';
    fillCustomers.style.width = custPct + '%';

    renderChart(prospects, leads, customers);
}

function renderChart(totalProspects, totalLeads, totalCustomers) {
    // Dynamic X-axis scale
    maxChartScale = Math.max(120, Math.ceil(totalProspects / 20) * 20);
    
    // Draw X-Axis Labels
    xAxisLabelsContainer.innerHTML = '';
    let steps = 6; // 0, 20, 40...
    let stepVal = maxChartScale / steps;
    for(let i=0; i<=steps; i++) {
        let span = document.createElement('span');
        let val = Math.round(i * stepVal);
        span.innerText = val + (i===0 ? ' people' : ' people');
        // Force absolute positioning of labels to match grids
        span.style.position = 'absolute';
        span.style.left = `calc(${(i/steps)*100}% - 15px)`;
        xAxisLabelsContainer.appendChild(span);
    }

    // Draw Grids
    gridLinesContainer.innerHTML = '';
    for(let i=1; i<=steps; i++) {
        let col = document.createElement('div');
        col.className = 'grid-line-col';
        col.style.position = 'absolute';
        col.style.left = `${(i/steps)*100}%`;
        gridLinesContainer.appendChild(col);
    }
    for(let i=1; i<=MAX_MONTHS; i++) {
        let row = document.createElement('div');
        row.className = 'grid-line-row';
        row.style.top = `${(i/MAX_MONTHS)*100}%`;
        gridLinesContainer.appendChild(row);
    }

    // Existing rows remove
    const oldRows = document.querySelectorAll('.bar-row-container');
    oldRows.forEach(r => r.remove());

    // Draw Bars (Cumulative logic per month, linear growth)
    let yGap = 100 / (MAX_MONTHS * 2);

    for(let m = 1; m <= MAX_MONTHS; m++) {
        let ratio = m / MAX_MONTHS;
        let p = Math.round(totalProspects * ratio);
        let l = Math.round(totalLeads * ratio);
        let c = Math.round(totalCustomers * ratio);

        let row = document.createElement('div');
        row.className = 'bar-row-container';
        
        // Width calculations relative to max scale
        let pw = (p / maxChartScale) * 100;
        let lw = (l / maxChartScale) * 100;
        let cw = (c / maxChartScale) * 100;

        let bP = document.createElement('div');
        bP.className = 'bar-segment bar-prospects';
        bP.style.width = pw + '%';

        let bL = document.createElement('div');
        bL.className = 'bar-segment bar-leads';
        bL.style.width = lw + '%';

        let bC = document.createElement('div');
        bC.className = 'bar-segment bar-customers';
        bC.style.width = cw + '%';

        row.appendChild(bP);
        row.appendChild(bL);
        row.appendChild(bC);

        // Tooltip logic
        bP.addEventListener('mouseenter', (e) => {
            tooltipMonth.innerText = `Month #${m}`;
            tooltipStats.innerHTML = `Prospects: ${p}<br>Leads: ${l}<br>Customers: ${c}`;
            tooltip.style.display = 'block';
        });

        bP.addEventListener('mousemove', (e) => {
            let rect = chartArea.getBoundingClientRect();
            let tx = e.clientX - rect.left + 15;
            let ty = e.clientY - rect.top + 15;
            tooltip.style.left = tx + 'px';
            tooltip.style.top = ty + 'px';
        });

        bP.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });

        chartArea.appendChild(row);
    }
}

// Event Listeners
[totalRevenueInput, aovInput, lrrSlider, prrSlider].forEach(el => {
    el.addEventListener('input', calculateModel);
});

// Init
calculateModel();
