# 📈 Financial Metrics Dashboard

A modern, interactive financial dashboard for tracking stock prices and company financial performance. Built with Vite, Tailwind CSS v4, and ApexCharts.

![Stock Price Chart](test_multi_metric.png)

## ✨ Features

- **Interactive Stock Price Charts**: Visualize historical price data with high-performance charts.
- **Comprehensive Financial Metrics**: Compare multiple metrics like Total Revenue, Net Income, Operating Income, and more.
- **Dual Timeframes**: Seamlessly switch between **Yearly** and **Quarterly** financial reports.
- **Dynamic Data Table**: Detailed breakdown of Income Statements, Balance Sheets, and Cash Flow statements.
- **Metric Selection**: Choose which metrics to visualize and compare in real-time.
- **Responsive Dark Mode UI**: A polished, professional dashboard designed for financial analysis.
- **Automatic Fallback**: Intelligent mock data generation if the API is unavailable, ensuring a smooth demo experience.

## 🚀 Tech Stack

- **Frontend**: [Vite](https://vitejs.dev/) (Fast development server & build tool)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Modern utility-first CSS framework)
- **Charts**: [ApexCharts](https://apexcharts.com/) (Interactive SVG charts)
- **Icons/UI**: Custom modern dark theme components
- **Language**: Modern JavaScript (ES Modules)

## 🛠️ Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- npm or yarn

### Getting Started

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/stockquotes.charts.git
   cd stockquotes.charts
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the development server**:

   ```bash
   npm run dev
   ```

4. **Open the dashboard**:
   Navigate to `http://localhost:5173/?ticker=AAPL` (replace `AAPL` with any ticker symbol).

## 📊 Usage

- **Loading Data**: Append `?ticker=SYMBOL` to the URL to load data for a specific company (e.g., `?ticker=MSFT`, `?ticker=TSLA`).
- **Toggling Views**: Use the "Yearly" and "Quarterly" buttons to switch the reporting period.
- **Comparing Metrics**: Click the checkboxes in the financial data table to add or remove metrics from the main chart.

## 📂 Project Structure

```text
├── src/
│   ├── api.js      # API interaction and mock data generation
│   ├── app.js      # Main application logic and state management
│   ├── charts.js   # ApexCharts initialization and updates
│   ├── table.js    # Dynamic table rendering and metric selection
│   ├── main.js     # Entry point
│   └── style.css   # Tailwind CSS configuration and custom styles
├── index.html      # Main HTML structure
├── vite.config.js  # Vite configuration
└── package.json    # Project dependencies and scripts
```

## 📜 License

This project is licensed under the ISC License.
