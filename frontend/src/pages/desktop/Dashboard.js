import { useState } from "react";
import {
  TrendingUp,
  UtensilsCrossed,
  CookingPot,
  Users,
  HandCoins,
} from "lucide-react";
import { rupee } from "static/js/myjs";
import LineChart from "common/charts/LineChart";
import BarChart from "common/charts/BarChart";

const Dashboard = () => {
  function generateData() {
    let labels = [];
    let data = [];
    for (let i = 0; i < 14; i++) {
      const randomNumber = Math.floor(Math.random() * (20 - 5 + 1)) + 5;
      let tm = i + 1;
      let ampm = "AM";
      if (tm >= 12) {
        ampm = "PM";
      }
      if (tm > 12) {
        tm = tm % 12;
      }
      labels.push(tm + ampm);
      data.push(randomNumber);
    }

    return [labels, data];
  }

  const summaryCards = [
    {
      label: "Items",
      value: 564,
      change: 5,
      icon: (
        <UtensilsCrossed
          size={54}
          className="text-background-orange border-4 border-background-orange p-2 rounded-full"
        />
      ),
      chartData: generateData(),
    },
    {
      label: "Orders",
      value: 173,
      change: 3,
      icon: (
        <CookingPot
          size={54}
          className="text-background-orange border-4 border-background-orange p-2 rounded-full"
        />
      ),
      chartData: generateData(),
    },
    {
      label: "Customers",
      value: 34,
      change: 5,
      icon: (
        <Users
          size={54}
          className="text-background-orange border-4 border-background-orange p-2 rounded-full"
        />
      ),
      chartData: generateData(),
    },
    {
      label: "Income",
      value: rupee + " 24,500",
      change: 7,
      icon: (
        <HandCoins
          size={54}
          className="text-background-orange border-4 border-background-orange p-2 rounded-full"
        />
      ),
      chartData: generateData(),
    },
  ];

  const revenueData = [
    1200, 1400, 1700, 1600, 2100, 3400, 3200, 4500, 1200, 800, 1100, 1300,
  ];
  const expenseData = [
    200, 400, 500, 600, 1200, 1400, 1200, 500, 200, 100, 150, 300,
  ];
  const revenueLabels = [
    "8AM",
    "9AM",
    "10AM",
    "11AM",
    "12PM",
    "1PM",
    "2PM",
    "3PM",
    "4PM",
    "5PM",
    "6PM",
    "7PM",
  ];

  const customerMapData = [23, 34, 45, 12, 56, 32, 56, 43, 23, 32, 21, 25];

  const [customerMapTime, setCustomerMapTime] = useState("daily");
  return (
    <>
      <div className="text-2xl font-semibold mb-4">Dashboard</div>
      <div className="grid grid-cols-4 gap-6">
        {summaryCards.map((summary, index) => (
          <div
            key={"summary_" + index}
            className="col-span-1 bg-white py-4 px-6 rounded-xl shadow-2xl"
          >
            <div className="flex items-center mb-4">
              <div className="flex-1">
                <div className="flex items-end">
                  <div className="text-2xl tracking-wide font-semibold">
                    {summary.value}
                  </div>
                  <div className="text-green-500 ms-4 font-semibold">
                    {summary.change}%
                  </div>
                  <TrendingUp size={20} className="ms-1 text-green-500" />
                </div>
                <div className="text-sm">{summary.label}</div>
              </div>
              <div>{summary.icon}</div>
            </div>
            <div className="h-[15vh] w-full">
              <LineChart
                chartData={summary.chartData}
                titles={[summary.label]}
              />
            </div>
          </div>
        ))}

        {/* Revenue vs Expense */}
        <div className="col-span-2 bg-white py-4 h-[50vh] px-6 flex flex-col rounded-xl shadow-2xl">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-2xl tracking-wide font-semibold">
                Revenue
              </div>
              <div className="text-xs text-gray-500">
                Track revenue vs expenses over time
              </div>
            </div>
            <div className="border px-4 text-sm py-1.5 rounded-full">
              <select className="focus:outline-none border-none">
                <option selected value="daily">
                  Daily
                </option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-center mt-4 mb-2 gap-10">
            <div className="text-center">
              <div className="text-xs text-gray-500">Income</div>
              <div className="font-bold">{rupee} 1,45,000</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Expense</div>
              <div className="font-bold">{rupee} 83,000</div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <LineChart
              chartData={[revenueLabels, revenueData, expenseData]}
              titles={["Revenue", "Expense"]}
              colors={["#fece4c", "red"]}
              showXAxis={true}
              showYAxis={true}
              showGrid={false}
            />
          </div>
        </div>

        {/* Customer Map */}
        <div className="col-span-2 bg-white py-4 h-[50vh] flex flex-col px-6 rounded-xl shadow-2xl">
          <div className="flex items-center mb-2">
            <div className="flex-1">
              <div className="text-2xl tracking-wide font-semibold">
                Customer Map
              </div>
              <div className="text-xs text-gray-500">
                Keep track of customer spread over time
              </div>
            </div>
            <div className="flex font-semibold border gap-2 text-sm px-2 items-center py-1.5 rounded-full">
              <div
                onClick={() => setCustomerMapTime("monthly")}
                className={`border cursor-pointer px-3 py-1 transition-all duration-200 rounded-full ${
                  customerMapTime == "monthly"
                    ? "bg-background-orange text-white"
                    : ""
                }`}
              >
                Monthly
              </div>
              <div
                onClick={() => setCustomerMapTime("daily")}
                className={`border cursor-pointer px-3 py-1 transition-all duration-200 rounded-full ${
                  customerMapTime == "daily"
                    ? "bg-background-orange text-white"
                    : ""
                }`}
              >
                Daily
              </div>
            </div>
          </div>
          <div className="w-full flex-1">
            <BarChart
              chartData={[revenueLabels, customerMapData]}
              titles={["Count"]}
              showXAxis={true}
              showYAxis={true}
              showGrid={false}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
