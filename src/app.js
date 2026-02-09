import {
  fetchHistoricalData,
  fetchFinancialStatements,
  getDateRange,
  parseQueryString,
} from './api.js';
import { updateCharts, destroyCharts } from './charts.js';
import { renderTable } from './table.js';

let currentState = {
  ticker: null,
  isYearly: true,
  historicalData: null,
  statements: null,
  selectedMetrics: ['totalRevenue'], // Default: Total Revenue selected
  dateRangeIndices: [0, 0], // For financial metrics
};

function showLoading() {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('error').classList.add('hidden');
  document.getElementById('dashboard-content').classList.add('hidden');
}

function hideLoading() {
  document.getElementById('loading').classList.add('hidden');
}

function showError(message) {
  hideLoading();
  document.getElementById('error').classList.remove('hidden');
  document.getElementById('error-message').textContent = message;
  document.getElementById('dashboard-content').classList.add('hidden');
}

function showDashboard() {
  hideLoading();
  document.getElementById('error').classList.add('hidden');
  document.getElementById('dashboard-content').classList.remove('hidden');
}

function updateToggleButtons() {
  const yearlyBtn = document.getElementById('toggle-yearly');
  const quarterlyBtn = document.getElementById('toggle-quarterly');

  if (currentState.isYearly) {
    yearlyBtn.className =
      'px-4 py-2 rounded-md text-sm font-medium transition-colors bg-blue-600 text-white';
    quarterlyBtn.className =
      'px-4 py-2 rounded-md text-sm font-medium transition-colors text-gray-300 hover:text-white';
  } else {
    yearlyBtn.className =
      'px-4 py-2 rounded-md text-sm font-medium transition-colors text-gray-300 hover:text-white';
    quarterlyBtn.className =
      'px-4 py-2 rounded-md text-sm font-medium transition-colors bg-blue-600 text-white';
  }
}

function handleMetricSelectionChange(metricKey, isSelected) {
  if (isSelected) {
    if (!currentState.selectedMetrics.includes(metricKey)) {
      currentState.selectedMetrics.push(metricKey);
    }
  } else {
    currentState.selectedMetrics = currentState.selectedMetrics.filter(m => m !== metricKey);
  }
  // Update chart with new selection
  updateCharts(
    currentState.historicalData,
    currentState.statements,
    currentState.isYearly,
    currentState.selectedMetrics,
    currentState.dateRangeIndices,
    currentState.dateRange
  );
}

function initSlider() {
  const reports = currentState.isYearly
    ? currentState.statements.annualReports
    : currentState.statements.quarterlyReports;

  if (!reports || reports.length === 0) return;

  const sortedReports = [...reports].sort(
    (a, b) => new Date(a.fiscalDateEnding) - new Date(b.fiscalDateEnding)
  );

  const minInput = document.getElementById('slider-min');
  const maxInput = document.getElementById('slider-max');
  const track = document.getElementById('slider-track');
  const labelContainer = document.getElementById('slider-labels');
  const dotContainer = document.getElementById('slider-dots');

  const maxIndex = sortedReports.length - 1;
  minInput.max = maxIndex;
  maxInput.max = maxIndex;

  // Default to showing last 5 years (5 annual reports or 20 quarterly reports)
  const range = currentState.isYearly ? 5 : 20;
  const initialStart = Math.max(0, maxIndex - (range - 1));
  currentState.dateRangeIndices = [initialStart, maxIndex];

  minInput.value = currentState.dateRangeIndices[0];
  maxInput.value = currentState.dateRangeIndices[1];

  function getReportStartDate(report) {
    const date = new Date(report.fiscalDateEnding);
    if (currentState.isYearly) {
      date.setFullYear(date.getFullYear() - 1);
    } else {
      date.setMonth(date.getMonth() - 3);
    }
    date.setDate(date.getDate() + 1);
    return date;
  }

  function updateSlider(e) {
    let min = parseInt(minInput.value);
    let max = parseInt(maxInput.value);

    // If they are equal, we might want to bring one to front based on direction
    // But for now, just handle the z-index of the one being moved
    if (e && e.target) {
      if (e.target.id === 'slider-min') {
        minInput.style.zIndex = '20';
        maxInput.style.zIndex = '10';
      } else {
        minInput.style.zIndex = '10';
        maxInput.style.zIndex = '20';
      }
    }

    if (min > max) {
      [min, max] = [max, min];
    }

    currentState.dateRangeIndices = [min, max];

    // Calculate date range for stock chart
    const startReport = sortedReports[min];
    const endReport = sortedReports[max];
    currentState.dateRange = {
      start: getReportStartDate(startReport),
      end: new Date(endReport.fiscalDateEnding),
    };

    const percent1 = (min / maxIndex) * 100;
    const percent2 = (max / maxIndex) * 100;

    track.style.left = percent1 + '%';
    track.style.width = percent2 - percent1 + '%';

    updateDashboard();
  }

  minInput.oninput = updateSlider;
  maxInput.oninput = updateSlider;

  // Render dots and labels
  dotContainer.innerHTML = '';
  labelContainer.innerHTML = '';

  const years = [...new Set(sortedReports.map(r => new Date(r.fiscalDateEnding).getFullYear()))];

  // Render dots for each report (if not too many)
  if (sortedReports.length <= 20) {
    sortedReports.forEach(() => {
      const dot = document.createElement('div');
      dot.className = 'w-1.5 h-1.5 bg-gray-900 rounded-full opacity-50';
      dotContainer.appendChild(dot);
    });
  }

  // If there are too many reports, just show year start/end or every few years
  const numLabels = Math.min(years.length, 5);
  for (let i = 0; i < numLabels; i++) {
    const yearIdx = numLabels > 1 ? Math.floor((i / (numLabels - 1)) * (years.length - 1)) : 0;
    const label = document.createElement('span');
    label.textContent = years[yearIdx];
    labelContainer.appendChild(label);
  }

  // Initial update
  updateSlider();
}

function updateDashboard() {
  if (!currentState.historicalData || !currentState.statements) {
    return;
  }

  updateCharts(
    currentState.historicalData,
    currentState.statements,
    currentState.isYearly,
    currentState.selectedMetrics,
    currentState.dateRangeIndices,
    currentState.dateRange
  );
  renderTable(
    'financial-table',
    currentState.statements,
    currentState.isYearly,
    currentState.selectedMetrics,
    handleMetricSelectionChange,
    currentState.dateRangeIndices
  );
}

async function loadData() {
  const { ticker } = parseQueryString();

  if (!ticker) {
    showError('Please provide a ticker symbol in the URL (e.g., ?ticker=AAPL)');
    return;
  }

  currentState.ticker = ticker;
  document.getElementById('ticker-display').textContent = ticker.toUpperCase();
  document.getElementById('company-name').textContent =
    `${ticker.toUpperCase()} Financial Dashboard`;

  showLoading();

  try {
    const dateRange = getDateRange(20);

    const [historicalData, statements] = await Promise.all([
      fetchHistoricalData(ticker, dateRange.from, dateRange.to, '1wk'),
      fetchFinancialStatements(ticker),
    ]);

    currentState.historicalData = historicalData;
    currentState.statements = statements;

    initSlider();
    updateDashboard();
    showDashboard();
  } catch (error) {
    console.error('Error loading data:', error);
    showError(
      `Failed to load data for ${ticker.toUpperCase()}. Please check the ticker symbol and try again.`
    );
  }
}

function setupEventListeners() {
  const yearlyBtn = document.getElementById('toggle-yearly');
  const quarterlyBtn = document.getElementById('toggle-quarterly');

  yearlyBtn.addEventListener('click', () => {
    if (!currentState.isYearly) {
      currentState.isYearly = true;
      updateToggleButtons();
      initSlider();
      updateDashboard();
    }
  });

  quarterlyBtn.addEventListener('click', () => {
    if (currentState.isYearly) {
      currentState.isYearly = false;
      updateToggleButtons();
      initSlider();
      updateDashboard();
    }
  });
}

export function init() {
  setupEventListeners();
  loadData();
}

export function cleanup() {
  destroyCharts();
}
