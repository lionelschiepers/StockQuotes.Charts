const API_BASE_URL = 'https://stockquote.lionelschiepers.synology.me/api';

// Mock data for demonstration when API is unavailable
function generateMockHistoricalData(ticker, fromDate, toDate) {
  const data = [];
  const start = new Date(fromDate);
  const end = new Date(toDate);
  let currentPrice = 150 + Math.random() * 50;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    // Random price movement
    const change = (Math.random() - 0.5) * 5;
    currentPrice = Math.max(50, currentPrice + change);

    data.push({
      date: d.toISOString().split('T')[0],
      close: parseFloat(currentPrice.toFixed(2)),
    });
  }

  return data;
}

export async function fetchHistoricalData(ticker, fromDate, toDate) {
  const url = `${API_BASE_URL}/yahoo-finance-historical?ticker=${ticker}&from=${fromDate}&to=${toDate}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // API returns { meta: {...}, quotes: [...] }
    // Extract quotes array and map to expected format
    if (data && data.quotes && Array.isArray(data.quotes)) {
      return data.quotes.map(quote => ({
        date: quote.date,
        close: quote.close,
      }));
    }

    // Fallback if data format is unexpected
    console.warn('Unexpected API response format, using mock data');
    return generateMockHistoricalData(ticker, fromDate, toDate);
  } catch (error) {
    console.warn('API unavailable, using mock data for historical prices');
    return generateMockHistoricalData(ticker, fromDate, toDate);
  }
}

// Mock financial statements data
function generateMockFinancialStatements(ticker) {
  const annualReports = [];
  const quarterlyReports = [];
  const currentYear = new Date().getFullYear();

  // Generate 5 years of annual data
  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    const revenue = 200000000000 + Math.random() * 50000000000;
    const netIncome = revenue * (0.15 + Math.random() * 0.1);
    const operatingIncome = revenue * 0.25;
    const grossProfit = revenue * 0.4;
    const incomeBeforeTax = netIncome * 1.2;
    const incomeTaxExpense = incomeBeforeTax - netIncome;
    const interestExpense = revenue * 0.01;
    const rndExpense = revenue * 0.07;
    const sgaExpense = revenue * 0.12;
    const depreciationAmortization = revenue * 0.05;
    const ebit = operatingIncome;
    const ebitda = ebit + depreciationAmortization;

    annualReports.push({
      fiscalDateEnding: `${year}-09-30`,
      incomeStatement: {
        totalRevenue: Math.round(revenue),
        netIncome: Math.round(netIncome),
        operatingIncome: Math.round(operatingIncome),
        grossProfit: Math.round(grossProfit),
        ebit: Math.round(ebit),
        ebitda: Math.round(ebitda),
        incomeBeforeTax: Math.round(incomeBeforeTax),
        incomeTaxExpense: Math.round(incomeTaxExpense),
        interestExpense: Math.round(interestExpense),
        researchAndDevelopment: Math.round(rndExpense),
        sellingGeneralAndAdministrative: Math.round(sgaExpense),
        depreciationAndAmortization: Math.round(depreciationAmortization),
        costOfRevenue: Math.round(revenue - grossProfit),
        operatingExpenses: Math.round(sgaExpense + rndExpense),
      },
      balanceSheet: {
        totalAssets: Math.round(revenue * 2),
        totalLiabilities: Math.round(revenue * 1.2),
        totalShareholderEquity: Math.round(revenue * 0.8),
        cashAndCashEquivalentsAtCarryingValue: Math.round(revenue * 0.15),
        totalCurrentAssets: Math.round(revenue * 0.5),
        totalCurrentLiabilities: Math.round(revenue * 0.4),
        shortTermInvestments: Math.round(revenue * 0.25),
        longTermInvestments: Math.round(revenue * 0.35),
        inventory: Math.round(revenue * 0.08),
        currentNetReceivables: Math.round(revenue * 0.12),
        shortLongTermDebtTotal: Math.round(revenue * 0.5),
        longTermDebt: Math.round(revenue * 0.4),
        shortTermDebt: Math.round(revenue * 0.1),
        propertyPlantEquipment: Math.round(revenue * 0.6),
        goodwill: Math.round(revenue * 0.1),
        intangibleAssets: Math.round(revenue * 0.15),
        retainedEarnings: Math.round(revenue * 0.45),
        commonStock: Math.round(revenue * 0.05),
      },
      cashFlow: {
        operatingCashflow: Math.round(netIncome * 1.2),
        capitalExpenditures: Math.round(revenue * 0.05),
        dividendPayout: Math.round(netIncome * 0.3),
        netIncome: Math.round(netIncome),
        depreciationDepletionAndAmortization: Math.round(depreciationAmortization),
        changeInReceivables: Math.round(-revenue * 0.02),
        changeInInventory: Math.round(-revenue * 0.01),
        changeInOperatingLiabilities: Math.round(revenue * 0.03),
        cashflowFromInvestment: Math.round(-revenue * 0.08),
        cashflowFromFinancing: Math.round(-revenue * 0.15),
        stockBasedCompensation: Math.round(revenue * 0.03),
      },
    });
  }

  // Generate 8 quarters of data
  for (let i = 0; i < 8; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i * 3);
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const year = date.getFullYear();
    const revenue = 50000000000 + Math.random() * 15000000000;
    const netIncome = revenue * (0.15 + Math.random() * 0.1);
    const operatingIncome = revenue * 0.25;
    const grossProfit = revenue * 0.4;
    const incomeBeforeTax = netIncome * 1.2;
    const incomeTaxExpense = incomeBeforeTax - netIncome;
    const interestExpense = revenue * 0.01;
    const rndExpense = revenue * 0.07;
    const sgaExpense = revenue * 0.12;
    const depreciationAmortization = revenue * 0.05;
    const ebit = operatingIncome;
    const ebitda = ebit + depreciationAmortization;

    quarterlyReports.push({
      fiscalDateEnding: `${year}-${String(quarter * 3).padStart(2, '0')}-30`,
      incomeStatement: {
        totalRevenue: Math.round(revenue),
        netIncome: Math.round(netIncome),
        operatingIncome: Math.round(operatingIncome),
        grossProfit: Math.round(grossProfit),
        ebit: Math.round(ebit),
        ebitda: Math.round(ebitda),
        incomeBeforeTax: Math.round(incomeBeforeTax),
        incomeTaxExpense: Math.round(incomeTaxExpense),
        interestExpense: Math.round(interestExpense),
        researchAndDevelopment: Math.round(rndExpense),
        sellingGeneralAndAdministrative: Math.round(sgaExpense),
        depreciationAndAmortization: Math.round(depreciationAmortization),
        costOfRevenue: Math.round(revenue - grossProfit),
        operatingExpenses: Math.round(sgaExpense + rndExpense),
      },
      balanceSheet: {
        totalAssets: Math.round(revenue * 8),
        totalLiabilities: Math.round(revenue * 4.8),
        totalShareholderEquity: Math.round(revenue * 3.2),
        cashAndCashEquivalentsAtCarryingValue: Math.round(revenue * 0.6),
        totalCurrentAssets: Math.round(revenue * 4),
        totalCurrentLiabilities: Math.round(revenue * 3.2),
        shortTermInvestments: Math.round(revenue * 2),
        longTermInvestments: Math.round(revenue * 2.8),
        inventory: Math.round(revenue * 0.32),
        currentNetReceivables: Math.round(revenue * 0.48),
        shortLongTermDebtTotal: Math.round(revenue * 4),
        longTermDebt: Math.round(revenue * 3.2),
        shortTermDebt: Math.round(revenue * 0.8),
        propertyPlantEquipment: Math.round(revenue * 4.8),
        goodwill: Math.round(revenue * 0.8),
        intangibleAssets: Math.round(revenue * 1.2),
        retainedEarnings: Math.round(revenue * 1.8),
        commonStock: Math.round(revenue * 0.2),
      },
      cashFlow: {
        operatingCashflow: Math.round(netIncome * 1.2),
        capitalExpenditures: Math.round(revenue * 0.2),
        dividendPayout: Math.round(netIncome * 0.3),
        netIncome: Math.round(netIncome),
        depreciationDepletionAndAmortization: Math.round(depreciationAmortization),
        changeInReceivables: Math.round(-revenue * 0.08),
        changeInInventory: Math.round(-revenue * 0.04),
        changeInOperatingLiabilities: Math.round(revenue * 0.12),
        cashflowFromInvestment: Math.round(-revenue * 0.32),
        cashflowFromFinancing: Math.round(-revenue * 0.6),
        stockBasedCompensation: Math.round(revenue * 0.12),
      },
    });
  }

  return { annualReports, quarterlyReports };
}

export async function fetchFinancialStatements(ticker) {
  const url = `${API_BASE_URL}/statements?ticker=${ticker}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('API unavailable, using mock data for financial statements');
    return generateMockFinancialStatements(ticker);
  }
}

export function getDateRange(years = 5) {
  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setFullYear(today.getFullYear() - years);
  fromDate.setDate(fromDate.getDate() + 1); // Add 1 day to get exactly 5 years of data (exclusive start date)

  const formatDate = date => {
    return date.toISOString().split('T')[0];
  };

  return {
    from: formatDate(fromDate),
    to: formatDate(today),
  };
}

export function parseQueryString() {
  const params = new URLSearchParams(window.location.search);
  return {
    ticker: params.get('ticker'),
  };
}
