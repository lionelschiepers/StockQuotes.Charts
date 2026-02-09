import ApexCharts from 'apexcharts';

let stockPriceChart = null;
let financialChart = null;

// Metric definitions with display info
const METRIC_DEFINITIONS = {
  // Income Statement
  totalRevenue: { label: 'Total Revenue', category: 'income' },
  netIncome: { label: 'Net Income', category: 'income' },
  operatingIncome: { label: 'Operating Income', category: 'income' },
  grossProfit: { label: 'Gross Profit', category: 'income' },
  // Balance Sheet
  totalAssets: { label: 'Total Assets', category: 'balance' },
  totalLiabilities: { label: 'Total Liabilities', category: 'balance' },
  totalShareholderEquity: { label: 'Total Shareholder Equity', category: 'balance' },
  cashAndCashEquivalentsAtCarryingValue: {
    label: 'Cash and Cash Equivalents',
    category: 'balance',
  },
  // Cash Flow
  operatingCashflow: { label: 'Operating Cashflow', category: 'cash' },
  capitalExpenditures: { label: 'Capital Expenditures', category: 'cash' },
  dividendPayout: { label: 'Dividend Payout', category: 'cash' },
  freeCashFlow: { label: 'Free Cash Flow', category: 'cash' },
  reportedEPS: { label: 'EPS', category: 'income' },
};

const commonChartOptions = {
  theme: {
    mode: 'dark',
    palette: 'palette1',
  },
  chart: {
    background: 'transparent',
    foreColor: '#e5e7eb',
    toolbar: {
      show: false,
    },
  },
  grid: {
    borderColor: '#374151',
    strokeDashArray: 0,
  },
  dataLabels: {
    enabled: false,
  },
};

function getMetricValue(report, metricKey) {
  // Check income statement
  if (report.incomeStatement && report.incomeStatement[metricKey] !== undefined) {
    return parseFloat(report.incomeStatement[metricKey]);
  }
  // Check balance sheet
  if (report.balanceSheet && report.balanceSheet[metricKey] !== undefined) {
    return parseFloat(report.balanceSheet[metricKey]);
  }
  // Check cash flow
  if (report.cashFlow && report.cashFlow[metricKey] !== undefined) {
    return parseFloat(report.cashFlow[metricKey]);
  }
  // Check ratio
  if (report.ratio && report.ratio[metricKey] !== undefined) {
    return parseFloat(report.ratio[metricKey]);
  }
  // Handle calculated metrics
  if (metricKey === 'freeCashFlow') {
    const operatingCF = parseFloat(report.cashFlow?.operatingCashflow || 0);
    const capex = parseFloat(report.cashFlow?.capitalExpenditures || 0);
    if (!isNaN(operatingCF) && !isNaN(capex)) {
      return operatingCF - capex;
    }
  }
  return null;
}

function formatChartValue(value) {
  const absValue = Math.abs(value);
  if (absValue >= 1000000000) {
    return (value / 1000000000).toFixed(2) + 'B';
  } else if (absValue >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M';
  } else if (absValue >= 1000) {
    return (value / 1000).toFixed(2) + 'K';
  }
  return value.toFixed(2);
}

export function initStockPriceChart(containerId, data, dateRange) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return;
  }

  console.log(`Rendering stock price chart with ${data?.length || 0} data points`);

  if (!data || data.length === 0) {
    container.innerHTML =
      '<div class="flex items-center justify-center h-full text-gray-400">No price data available</div>';
    return;
  }

  const filteredData = dateRange
    ? data.filter(
        item => new Date(item.date) >= dateRange.start && new Date(item.date) <= dateRange.end
      )
    : data;

  const series = filteredData.map(item => ({
    x: new Date(item.date).getTime(),
    y: item.close,
  }));

  const options = {
    ...commonChartOptions,
    series: [
      {
        name: 'Stock Price',
        data: series,
      },
    ],
    chart: {
      ...commonChartOptions.chart,
      type: 'line',
      height: 256,
      zoom: {
        enabled: true,
        type: 'x',
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#9ca3af',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#9ca3af',
        },
        formatter: value => {
          return '$' + value.toFixed(2);
        },
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: value => {
          return '$' + value.toFixed(2);
        },
      },
    },
  };

  if (stockPriceChart) {
    stockPriceChart.destroy();
  }

  stockPriceChart = new ApexCharts(container, options);
  stockPriceChart.render();
}

export function initFinancialChart(
  containerId,
  reports,
  isYearly,
  selectedMetrics,
  dateRangeIndices
) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear container if no metrics selected
  if (!selectedMetrics || selectedMetrics.length === 0) {
    container.innerHTML =
      '<div class="flex items-center justify-center h-64 text-gray-400">Select metrics from the table below to display</div>';
    if (financialChart) {
      financialChart.destroy();
      financialChart = null;
    }
    return;
  }

  const allSortedReports = [...reports].sort(
    (a, b) => new Date(a.fiscalDateEnding) - new Date(b.fiscalDateEnding)
  );

  const filteredReports = dateRangeIndices
    ? allSortedReports.slice(dateRangeIndices[0], dateRangeIndices[1] + 1)
    : allSortedReports.slice(-5);

  const categories = filteredReports.map(report => {
    const date = new Date(report.fiscalDateEnding);
    if (isYearly) {
      return date.getFullYear().toString();
    } else {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${date.getFullYear()}`;
    }
  });

  // Create series for each selected metric
  // Use grouped bar chart for all cases (single or multiple metrics)
  // Grouped bars allow easy comparison of multiple metrics side by side
  const series = selectedMetrics
    .map(metricKey => {
      const definition = METRIC_DEFINITIONS[metricKey];
      if (!definition) return null;

      const data = filteredReports.map(report => {
        const value = getMetricValue(report, metricKey);
        // For null values, use 0 instead of null to avoid ApexCharts issues
        return value !== null && !isNaN(value) ? value : 0;
      });

      return {
        name: definition.label,
        data: data,
      };
    })
    .filter(s => s !== null);

  if (series.length === 0) {
    container.innerHTML =
      '<div class="flex items-center justify-center h-64 text-gray-400">No data available for selected metrics</div>';
    if (financialChart) {
      financialChart.destroy();
      financialChart = null;
    }
    return;
  }

  // Debug logging
  console.log('Series data:', JSON.stringify(series, null, 2));
  console.log('Categories:', categories);

  const options = {
    ...commonChartOptions,
    series: series,
    chart: {
      ...commonChartOptions.chart,
      type: 'bar',
      height: 256,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth:
          selectedMetrics.length === 1
            ? '60%'
            : `${Math.max(40, 70 - selectedMetrics.length * 10)}%`,
        borderRadius: 4,
        borderRadiusApplication: 'end',
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: '#9ca3af',
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#9ca3af',
        },
        formatter: value => {
          return formatChartValue(value);
        },
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: value => {
          return formatChartValue(value);
        },
      },
    },
    legend: {
      position: 'top',
      labels: {
        colors: '#e5e7eb',
      },
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  };

  if (financialChart) {
    financialChart.destroy();
  }

  financialChart = new ApexCharts(container, options);
  financialChart.render();
}

export function updateCharts(
  historicalData,
  statements,
  isYearly,
  selectedMetrics = [],
  dateRangeIndices,
  dateRange
) {
  const reports = isYearly ? statements.annualReports : statements.quarterlyReports;

  if (historicalData && historicalData.length > 0) {
    initStockPriceChart('stock-price-chart', historicalData, dateRange);
  }

  if (reports && reports.length > 0) {
    initFinancialChart('cashflow-chart', reports, isYearly, selectedMetrics, dateRangeIndices);
  }
}

export function destroyCharts() {
  if (stockPriceChart) {
    stockPriceChart.destroy();
    stockPriceChart = null;
  }
  if (financialChart) {
    financialChart.destroy();
    financialChart = null;
  }
}
