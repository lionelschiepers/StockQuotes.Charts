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

  let value = null;
  if (report.incomeStatement && metric.key in report.incomeStatement) {
    value = report.incomeStatement[metric.key];
  } else if (report.balanceSheet && metric.key in report.balanceSheet) {
    value = report.balanceSheet[metric.key];
  } else if (report.cashFlow && metric.key in report.cashFlow) {
    value = report.cashFlow[metric.key];
  } else if (report.ratio && metric.key in report.ratio) {
    value = report.ratio[metric.key];
  }

  // Fallback for EBIT
  if ((value === null || value === undefined) && metric.key === 'ebit') {
    return report.incomeStatement?.operatingIncome ?? null;
  }

  // Fallback for EBITDA
  if ((value === null || value === undefined) && metric.key === 'ebitda') {
    const ebit = report.incomeStatement?.ebit ?? report.incomeStatement?.operatingIncome;
    const da =
      report.incomeStatement?.depreciationAndAmortization ??
      report.cashFlow?.depreciationDepletionAndAmortization;

    if (ebit !== undefined && ebit !== null && da !== undefined && da !== null) {
      return parseFloat(ebit) + parseFloat(da);
    }
  }

  return value;
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
      <h3 class="text-lg font-semibold mb-3 px-4" style="color: var(--text-primary);">${title}</h3>
      <table class="w-full">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color);">
            <th class="text-left py-3 px-4 font-medium w-8" style="color: var(--text-secondary);"></th>
            <th class="text-left py-3 px-4 font-medium" style="color: var(--text-secondary);">Metric</th>
            ${sortedReports
              .map(
                report => `
              <th class="text-right py-3 px-4 font-medium" style="color: var(--text-secondary);">
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
    const rowBg = index % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)';
    const isChecked = selectedMetrics.includes(metric.key) ? 'checked' : '';
    html += `
      <tr style="background-color: ${rowBg};">
        <td class="py-3 px-4">
          <input 
            type="checkbox" 
            class="metric-checkbox w-4 h-4 rounded cursor-pointer"
            style="background-color: var(--bg-secondary); border: 1px solid var(--border-subtle);"
            data-metric="${metric.key}"
            ${isChecked}
          />
        </td>
        <td class="py-3 px-4" style="color: var(--text-secondary);">${metric.label}</td>
        ${sortedReports
          .map(report => {
            const value = getMetricValue(report, metric);
            const formatted = formatNumber(value);
            const numValue = parseFloat(value);
            const colorStyle =
              numValue < 0 ? 'color: var(--accent-red);' : 'color: var(--text-secondary);';
            return `<td class="text-right py-3 px-4" style="${colorStyle}">${formatted}</td>`;
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
    container.innerHTML =
      '<p class="p-4" style="color: var(--text-muted);">No financial data available</p>';
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
