// Translations
const translations = {
    en: {
        lang: "Language",
        curr: "Currency",
        campStart: "Campaign Start",
        campEnd: "Campaign End",
        rev: "Total Revenue",
        aov: "Avg. Order Value",
        months: "Months",
        prospects: "Prospects",
        leads: "Leads",
        customers: "Customers",
        lrr: "Lead Response Rate",
        prr: "Prospect Response Rate",
        people: "people",
        monthNum: "Month #"
    },
    bg: {
        lang: "Език",
        curr: "Валута",
        campStart: "Начало кампания",
        campEnd: "Край кампания",
        rev: "Общи приходи",
        aov: "Ср. оборот",
        months: "Месеци",
        prospects: "Потенциални",
        leads: "Контакти",
        customers: "Клиенти",
        lrr: "Честота отговор (Контакти)",
        prr: "Честота отговор (Потенциални)",
        people: "души",
        monthNum: "Месец №"
    }
};

let currentLang = 'en';

// DOM Elements
const langSelect = document.getElementById('lang-select');
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

function updateLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];

    // Sidebar labels
    const sidebarLabels = document.querySelectorAll('.sidebar .form-group label');
    if (sidebarLabels.length >= 6) {
        sidebarLabels[0].innerText = t.lang;
        sidebarLabels[1].innerText = t.curr;
        sidebarLabels[2].innerText = t.campStart;
        sidebarLabels[3].innerText = t.campEnd;
        sidebarLabels[4].innerText = t.rev;
        sidebarLabels[5].innerText = t.aov;
    }

    // Y-axis label
    const yAxisTitle = document.querySelector('.axis-title');
    if (yAxisTitle) yAxisTitle.innerText = t.months;

    // Card titles (preserve SVG icons)
    const cardTitles = document.querySelectorAll('.card-title');
    if (cardTitles.length >= 3) {
        cardTitles[0].innerHTML = cardTitles[0].innerHTML.replace(/Prospects|Потенциални/, t.prospects);
        cardTitles[1].innerHTML = cardTitles[1].innerHTML.replace(/Leads|Контакти/, t.leads);
        cardTitles[2].innerHTML = cardTitles[2].innerHTML.replace(/Customers|Клиенти/, t.customers);
    }

    // Slider Header labels
    const sliderLabels = document.querySelectorAll('.slider-header label');
    if (sliderLabels.length >= 2) {
        sliderLabels[0].innerText = t.lrr;
        sliderLabels[1].innerText = t.prr;
    }

    // Refresh chart to apply string updates (tooltips, people text, etc)
    calculateModel();
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

    // Update slider texts
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
    const t = translations[currentLang];
    
    // Dynamic X-axis scale
    maxChartScale = Math.max(120, Math.ceil(totalProspects / 20) * 20);
    
    // Draw X-Axis Labels
    xAxisLabelsContainer.innerHTML = '';
    let steps = 6; 
    let stepVal = maxChartScale / steps;
    for(let i=0; i<=steps; i++) {
        let span = document.createElement('span');
        let val = Math.round(i * stepVal);
        span.innerText = `${val} ${t.people}`;
        span.style.position = 'absolute';
        span.style.left = `calc(${(i/steps)*100}% - 22px)`;
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

    // Remove existing rows
    const oldRows = document.querySelectorAll('.bar-row-container');
    oldRows.forEach(r => r.remove());

    for(let m = 1; m <= MAX_MONTHS; m++) {
        let ratio = m / MAX_MONTHS;
        let p = Math.round(totalProspects * ratio);
        let l = Math.round(totalLeads * ratio);
        let c = Math.round(totalCustomers * ratio);

        let row = document.createElement('div');
        row.className = 'bar-row-container';
        
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
            tooltipMonth.innerText = `${t.monthNum}${m}`;
            tooltipStats.innerHTML = `${t.prospects}: ${p}<br>${t.leads}: ${l}<br>${t.customers}: ${c}`;
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
langSelect.addEventListener('change', (e) => {
    updateLanguage(e.target.value);
});

// Init
updateLanguage('en'); 
