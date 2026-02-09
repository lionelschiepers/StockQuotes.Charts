const INCOME_STATEMENT_METRICS = [
  { key: 'totalRevenue', label: 'Total Revenue' },
  { key: 'grossProfit', label: 'Gross Profit' },
  { key: 'operatingIncome', label: 'Operating Income' },
  { key: 'ebit', label: 'EBIT' },
  { key: 'ebitda', label: 'EBITDA' },
  { key: 'incomeBeforeTax', label: 'Income Before Tax' },
  { key: 'incomeTaxExpense', label: 'Income Tax Expense' },
  { key: 'interestExpense', label: 'Interest Expense' },
  { key: 'netIncome', label: 'Net Income' },
  { key: 'reportedEPS', label: 'EPS' },
  { key: 'researchAndDevelopment', label: 'R&D Expenses' },
  { key: 'sellingGeneralAndAdministrative', label: 'SG&A Expenses' },
  { key: 'depreciationAndAmortization', label: 'Depreciation & Amortization' },
  { key: 'costOfRevenue', label: 'Cost of Revenue' },
  { key: 'operatingExpenses', label: 'Operating Expenses' },
];

const BALANCE_SHEET_METRICS = [
  { key: 'totalAssets', label: 'Total Assets' },
  { key: 'totalLiabilities', label: 'Total Liabilities' },
  { key: 'totalShareholderEquity', label: 'Total Shareholder Equity' },
  { key: 'cashAndCashEquivalentsAtCarryingValue', label: 'Cash and Cash Equivalents' },
  { key: 'totalCurrentAssets', label: 'Current Assets' },
  { key: 'totalCurrentLiabilities', label: 'Current Liabilities' },
  { key: 'shortTermInvestments', label: 'Short Term Investments' },
  { key: 'longTermInvestments', label: 'Long Term Investments' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'currentNetReceivables', label: 'Accounts Receivable' },
  { key: 'shortLongTermDebtTotal', label: 'Total Debt' },
  { key: 'longTermDebt', label: 'Long Term Debt' },
  { key: 'shortTermDebt', label: 'Short Term Debt' },
  { key: 'propertyPlantEquipment', label: 'Property, Plant & Equipment' },
  { key: 'goodwill', label: 'Goodwill' },
  { key: 'intangibleAssets', label: 'Intangible Assets' },
  { key: 'retainedEarnings', label: 'Retained Earnings' },
  { key: 'commonStock', label: 'Common Stock' },
];

const CASH_FLOW_METRICS = [
  { key: 'operatingCashflow', label: 'Operating Cashflow' },
  { key: 'capitalExpenditures', label: 'Capital Expenditures' },
  { key: 'freeCashFlow', label: 'Free Cash Flow', calculated: true },
  { key: 'dividendPayout', label: 'Dividend Payout' },
  { key: 'netIncome', label: 'Net Income' },
  { key: 'depreciationDepletionAndAmortization', label: 'Depreciation & Amortization' },
  { key: 'changeInReceivables', label: 'Change in Receivables' },
  { key: 'changeInInventory', label: 'Change in Inventory' },
  { key: 'changeInOperatingLiabilities', label: 'Change in Operating Liabilities' },
  { key: 'cashflowFromInvestment', label: 'Investing Cash Flow' },
  { key: 'cashflowFromFinancing', label: 'Financing Cash Flow' },
  { key: 'stockBasedCompensation', label: 'Stock Based Compensation' },
];

function formatNumber(value) {
  if (value === null || value === undefined || value === 'None') return '-';

  const num = parseFloat(value);
  if (isNaN(num)) return '-';

  const absNum = Math.abs(num);

  if (absNum >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  } else if (absNum >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  } else if (absNum >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  } else {
    return num.toFixed(2);
  }
}

function getMetricValue(report, metric) {
  if (metric.calculated && metric.key === 'freeCashFlow') {
    const operatingCF = parseFloat(report.cashFlow?.operatingCashflow || 0);
    const capex = parseFloat(report.cashFlow?.capitalExpenditures || 0);
    if (!isNaN(operatingCF) && !isNaN(capex)) {
      return operatingCF - capex;
    }
    return null;
  }

  if (report.incomeStatement && metric.key in report.incomeStatement) {
    return report.incomeStatement[metric.key];
  }
  if (report.balanceSheet && metric.key in report.balanceSheet) {
    return report.balanceSheet[metric.key];
  }
  if (report.cashFlow && metric.key in report.cashFlow) {
    return report.cashFlow[metric.key];
  }
  if (report.ratio && metric.key in report.ratio) {
    return report.ratio[metric.key];
  }
  return null;
}

function formatDate(dateStr, isYearly) {
  const date = new Date(dateStr);
  if (isYearly) {
    return date.getFullYear().toString();
  } else {
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `Q${quarter} '${date.getFullYear().toString().slice(2)}`;
  }
}

function createTableSection(
  title,
  metrics,
  reports,
  isYearly,
  selectedMetrics,
  onMetricChange,
  dateRangeIndices
) {
  const ascendingSorted = [...reports].sort(
    (a, b) => new Date(a.fiscalDateEnding) - new Date(b.fiscalDateEnding)
  );

  const filteredReports = dateRangeIndices
    ? ascendingSorted.slice(dateRangeIndices[0], dateRangeIndices[1] + 1)
    : ascendingSorted.slice(-5);

  const sortedReports = [...filteredReports].reverse();

  let html = `
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-white mb-3 px-4">${title}</h3>
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-700">
            <th class="text-left py-3 px-4 text-gray-300 font-medium w-8"></th>
            <th class="text-left py-3 px-4 text-gray-300 font-medium">Metric</th>
            ${sortedReports
              .map(
                report => `
              <th class="text-right py-3 px-4 text-gray-300 font-medium">
                ${formatDate(report.fiscalDateEnding, isYearly)}
              </th>
            `
              )
              .join('')}
          </tr>
        </thead>
        <tbody>
  `;

  metrics.forEach((metric, index) => {
    const rowClass = index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750';
    const isChecked = selectedMetrics.includes(metric.key) ? 'checked' : '';
    html += `
      <tr class="${rowClass}">
        <td class="py-3 px-4">
          <input 
            type="checkbox" 
            class="metric-checkbox w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700 cursor-pointer"
            data-metric="${metric.key}"
            ${isChecked}
          />
        </td>
        <td class="py-3 px-4 text-gray-300">${metric.label}</td>
        ${sortedReports
          .map(report => {
            const value = getMetricValue(report, metric);
            const formatted = formatNumber(value);
            const numValue = parseFloat(value);
            const colorClass = numValue < 0 ? 'text-red-400' : 'text-gray-300';
            return `<td class="text-right py-3 px-4 ${colorClass}">${formatted}</td>`;
          })
          .join('')}
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  return html;
}

export function renderTable(
  containerId,
  statements,
  isYearly,
  selectedMetrics = [],
  onMetricChange = null,
  dateRangeIndices
) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const reports = isYearly ? statements.annualReports : statements.quarterlyReports;

  if (!reports || reports.length === 0) {
    container.innerHTML = '<p class="text-gray-400 p-4">No financial data available</p>';
    return;
  }

  let html = '';
  html += createTableSection(
    'Income Statement',
    INCOME_STATEMENT_METRICS,
    reports,
    isYearly,
    selectedMetrics,
    onMetricChange,
    dateRangeIndices
  );
  html += createTableSection(
    'Balance Sheet',
    BALANCE_SHEET_METRICS,
    reports,
    isYearly,
    selectedMetrics,
    onMetricChange,
    dateRangeIndices
  );
  html += createTableSection(
    'Cash Flow',
    CASH_FLOW_METRICS,
    reports,
    isYearly,
    selectedMetrics,
    onMetricChange,
    dateRangeIndices
  );

  container.innerHTML = html;

  // Attach event listeners to checkboxes
  if (onMetricChange) {
    const checkboxes = container.querySelectorAll('.metric-checkbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', e => {
        const metricKey = e.target.dataset.metric;
        onMetricChange(metricKey, e.target.checked);
      });
    });
  }
}
