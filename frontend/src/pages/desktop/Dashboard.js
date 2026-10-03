import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  UtensilsCrossed,
  CookingPot,
  Users,
  HandCoins,
} from "lucide-react";
import { money } from "static/js/myjs";
import LineChart from "common/charts/LineChart";
import MixedChart from "common/charts/MixedChart";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getCustomerMapStats } from "apis/dashboard";

const Dashboard = () => {
  const [period, setPeriod] = useState("daily");
  const [chartPeriod, setChartPeriod] = useState("monthly");

  const { data: stats, isLoading } = useQuery({
    queryKey: ["getDashboardStats", period],
    queryFn: () => getDashboardStats(period),
    refetchInterval: 60000,
  });

  const { data: chartStats } = useQuery({
    queryKey: ["getDashboardStats", chartPeriod],
    queryFn: () => getDashboardStats(chartPeriod),
  });

  const [customerMapTime, setCustomerMapTime] = useState("daily");

  const { data: customerStats } = useQuery({
    queryKey: ["getCustomerMapStats", customerMapTime],
    queryFn: () => getCustomerMapStats(customerMapTime),
  });

  const summaryCards = [
    {
      label: "Items",
      value: stats?.summary?.items || 0,
      change: stats?.summary?.items_change || 0,
      icon: (
        <UtensilsCrossed
          size={54}
          className="text-background-orange border-4 border-background-orange p-2 rounded-full"
        />
      ),
      chartData: [stats?.charts?.labels || [], stats?.charts?.items || []],
    },
    {
      label: "Orders",
      value: stats?.summary?.orders || 0,
      change: stats?.summary?.orders_change || 0,
      icon: (
        <CookingPot
          size={54}
          className="text-background-orange border-4 border-background-orange p-2 rounded-full"
        />
      ),
      chartData: [stats?.charts?.labels || [], stats?.charts?.orders || []],
    },
    {
      label: "Customers",
      value: stats?.summary?.customers || 0,
      change: stats?.summary?.customers_change || 0,
      icon: (
        <Users
          size={54}
          className="text-background-orange border-4 border-background-orange p-2 rounded-full"
        />
      ),
      chartData: [stats?.charts?.labels || [], stats?.charts?.customers || []],
    },
    {
      label: "Income",
      value: money(stats?.summary?.revenue),
      change: stats?.summary?.revenue_change || 0,
      icon: (
        <HandCoins
          size={54}
          className="text-background-orange border-4 border-background-orange p-2 rounded-full"
        />
      ),
      chartData: [stats?.charts?.labels || [], stats?.charts?.revenue || []],
    },
  ];


  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <div className="text-2xl font-semibold">Dashboard</div>
        <div className="border px-4 text-sm py-1 rounded-full">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="focus:outline-none border-none py-1"
          >
            <option value="daily">Today</option>
            <option value="monthly">This Month</option>
            <option value="last_30_days">Last 30 Days</option>
          </select>
        </div>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 transition-opacity ${isLoading ? "opacity-50" : ""}`}>
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
                  <div className={`ms-4 font-semibold flex items-center ${summary.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <span>{Math.abs(summary.change)}%</span>
                    {summary.change >= 0 ? (
                      <TrendingUp size={18} className="ms-1" />
                    ) : (
                      <TrendingDown size={18} className="ms-1" />
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">{summary.label}</div>
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
        <div className="md:col-span-2 bg-white py-4 h-[50vh] px-6 flex flex-col rounded-xl shadow-2xl">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="text-2xl tracking-wide font-semibold">
                Revenue
              </div>
              <div className="text-xs text-gray-500">
                Track revenue over time
              </div>
            </div>
            <div className="border px-4 text-sm py-1 rounded-full">
              <select
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value)}
                className="focus:outline-none border-none py-1"
              >
                <option value="monthly">This Month</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="yearly">Last Year</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-center mt-4 mb-2 gap-10">
            <div className="text-center">
              <div className="text-xs text-gray-500">Income</div>
              <div className="font-bold">{money(chartStats?.summary?.revenue)}</div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <LineChart
              chartData={[
                chartStats?.charts?.labels || [],
                chartStats?.charts?.revenue || []
              ]}
              titles={["Revenue"]}
              colors={["#fece4c", "red"]}
              showXAxis={true}
              showYAxis={true}
              showGrid={false}
            />
          </div>
        </div>

        {/* Customer Map */}
        <div className="md:col-span-2 bg-white py-4 h-[50vh] flex flex-col px-6 rounded-xl shadow-2xl">
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
                onClick={() => setCustomerMapTime("daily")}
                className={`border cursor-pointer px-3 py-1 transition-all duration-200 rounded-full ${customerMapTime == "daily"
                  ? "bg-background-orange text-white"
                  : ""
                  }`}
              >
                Daily
              </div>
              <div
                onClick={() => setCustomerMapTime("weekly")}
                className={`border cursor-pointer px-3 py-1 transition-all duration-200 rounded-full ${customerMapTime == "weekly"
                  ? "bg-background-orange text-white"
                  : ""
                  }`}
              >
                Weekly
              </div>
              <div
                onClick={() => setCustomerMapTime("monthly")}
                className={`border cursor-pointer px-3 py-1 transition-all duration-200 rounded-full ${customerMapTime == "monthly"
                  ? "bg-background-orange text-white"
                  : ""
                  }`}
              >
                Monthly
              </div>
            </div>
          </div>
          <div className="w-full flex-1">
            <MixedChart
              chartData={[
                customerStats?.labels || [],
                customerStats?.current || [],
                customerStats?.average || []
              ]}
              titles={["Current", "Average"]}
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
