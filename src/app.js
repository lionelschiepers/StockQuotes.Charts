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
    currentState.selectedMetrics
  );
}

function updateDashboard() {
  if (!currentState.historicalData || !currentState.statements) {
    return;
  }

  updateCharts(
    currentState.historicalData,
    currentState.statements,
    currentState.isYearly,
    currentState.selectedMetrics
  );
  renderTable(
    'financial-table',
    currentState.statements,
    currentState.isYearly,
    currentState.selectedMetrics,
    handleMetricSelectionChange
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
    const dateRange = getDateRange(5);

    const [historicalData, statements] = await Promise.all([
      fetchHistoricalData(ticker, dateRange.from, dateRange.to),
      fetchFinancialStatements(ticker),
    ]);

    currentState.historicalData = historicalData;
    currentState.statements = statements;

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
      updateDashboard();
    }
  });

  quarterlyBtn.addEventListener('click', () => {
    if (currentState.isYearly) {
      currentState.isYearly = false;
      updateToggleButtons();
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
