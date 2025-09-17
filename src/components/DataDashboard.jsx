import React, { useEffect, useState } from "react";
import {
  Database,
  Users,
  BarChart3,
  ChartPie,
  SquareDashedKanban,
  Activity,
  ChevronRight,
  Loader2,
  ChevronLeft,
  Download,
} from "lucide-react";

const DataDashboard = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10); // Records per page


  // Configuration for your 6 datasets
  const datasets = [
    {
      id: 1,
      title: "Country Wise Latest",
      description:
        "Most recent COVID-19 statistics and metrics by country with current status",
      icon: Users,
      endpoint: "/api/country-wise/page", // Replace with your actual endpoint
      color: "from-blue-500 to-cyan-500",
      stats: "Latest Data",
    },
    {
      id: 2,
      title: "COVID-19 Clean Complete",
      description:
        "Comprehensive cleaned dataset with complete COVID-19 records and standardized data",
      icon: Database,
      endpoint: "/api/covid-cases/page", // Replace with your actual endpoint
      color: "from-emerald-500 to-teal-500",
      stats: "Complete Dataset",
    },
    {
      id: 3,
      title: "Day Wise Analysis",
      description:
        "Daily progression and trends of COVID-19 cases with temporal insights",
      icon: BarChart3,
      endpoint: "/api/day_wise/page", // Replace with your actual endpoint
      color: "from-purple-500 to-pink-500",
      stats: "Daily Trends",
    },
    {
      id: 4,
      title: "USA Country Wise",
      description:
        "State-by-state COVID-19 data across the United States with detailed breakdowns",
      icon: ChartPie,
      endpoint: "/api/usa_country_wise/page", // Replace with your actual endpoint
      color: "from-orange-500 to-red-500",
      stats: "USA States",
    },
    {
      id: 5,
      title: "Worldometer Data",
      description:
        "Global COVID-19 statistics from Worldometer with real-time tracking metrics",
      icon: Activity,
      endpoint: "/api/world_meter/page", // Replace with your actual endpoint
      color: "from-indigo-500 to-purple-500",
      stats: "Global Stats",
    },
    {
      id: 6,
      title: "Full Grouped Data",
      description:
        "Aggregated COVID-19 statistics grouped by regions with comprehensive breakdowns",
      icon: SquareDashedKanban,
      endpoint: "/api/full_grouped/page", // Replace with your actual endpoint
      color: "from-gray-500 to-slate-600",
      stats: "Regional Groups",
    },
  ];

  const fetchData = async (endpoint, cardId, page = 0) => {
    setLoading(true);
    setError(null);
    setSelectedCard(cardId);

    try {
      // Replace with your actual Spring Boot backend URL

      const paginatedEndpoint = `${endpoint}?page=${page}&size=${pageSize}`;

      const response = await fetch(
        `http://localhost:8090${paginatedEndpoint}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add any authentication headers if needed
            // 'Authorization': `Bearer ${token}`
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // Handle different response formats
      if (result.content && Array.isArray(result.content)) {
        // Spring Boot Page response format
        setData(result.content);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
        setCurrentPage(result.currentPage);
      } else {
        // Single object or other format
        setData([result]);
        setTotalPages(1);
        setTotalElements(1);
        setCurrentPage(0);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((data || error)) {
      const section = document.getElementById("data-display");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [data, error]); 

  const handleCardClick = (dataset) => {
    fetchData(dataset.endpoint, dataset.id);
  };

  const handlePageChange = (newPage) => {
    const dataset = datasets.find((d) => d.id === selectedCard);
    if (dataset) {
      fetchData(dataset.endpoint, selectedCard, newPage);
    }
  };

  const renderTableHeaders = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return null;

    const firstItem = dataArray[0];
   return (
    <>
      {Object.keys(firstItem).map((key) => (
        <th
          key={key}
          className="px-6 py-4 text-left text-xs font-semibold text-purple-300 uppercase tracking-wider border-b border-purple-500/30"
        >
          {key
            .replace(/_/g, " ")
            .replace(/([A-Z])/g, " $1")
            .trim()}
        </th>
      ))}

      {/* Add extra headers only if datasetId = 1 */}
      {selectedCard === 1 && (
        <>
          <th className="px-6 py-4 text-left text-xs font-semibold text-red-400 uppercase tracking-wider border-b border-purple-500/30">
            Death %
          </th>
          <th className="px-6 py-4 text-left text-xs font-semibold text-green-400 uppercase tracking-wider border-b border-purple-500/30">
            Recovered %
          </th>
        </>
      )}
    </>
  );
};
  const renderTableRows = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return null;

   return dataArray.map((item, index) => {
    const deathPercentage =
       selectedCard === 1 && item.confirmed && item.deaths
        ? ((item.deaths / item.confirmed) * 100).toFixed(2) + "%"
        : "-";

    const recoveredPercentage =
      selectedCard === 1 && item.confirmed && item.recovered
        ? ((item.recovered / item.confirmed) * 100).toFixed(2) + "%"
        : "-";

    return (
      <tr
        key={index}
        className="hover:bg-white/5 transition-colors duration-200"
      >
        {Object.values(item).map((value, valueIndex) => (
          <td
            key={valueIndex}
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 border-b border-gray-700/50"
          >
            {value !== null && value !== undefined ? String(value) : "-"}
          </td>
        ))}

        {/* Extra cells only for dataset id=1 */}
        {selectedCard === 1 && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400 font-semibold border-b border-gray-700/50">
              {deathPercentage}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-semibold border-b border-gray-700/50">
              {recoveredPercentage}
            </td>
          </>
        )}

      </tr>
    );
  });
};


  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `covid_data_page_${currentPage + 1}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500 rounded-full opacity-10 animate-ping"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-4">
            Data Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Click on any dataset card to fetch and explore your data with
            real-time visualization
          </p>
        </div>

        {/* Dataset Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {datasets.map((dataset) => {
            const IconComponent = dataset.icon;
            const isSelected = selectedCard === dataset.id;

            return (
              <div
                key={dataset.id}
                onClick={() => {
                  handleCardClick(dataset);
                }}
                className={`group relative cursor-pointer transition-all duration-500 ease-out transform hover:scale-105 hover:-translate-y-2 ${
                  isSelected ? "scale-105 -translate-y-2" : ""
                }`}
              >
                {/* Card Background with Glassmorphism */}
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500">
                  {/* Gradient Border Animation */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${dataset.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                  ></div>

                  {/* Loading Indicator */}
                  {loading && isSelected && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-r ${dataset.color} p-3 mb-4 group-hover:rotate-12 transition-transform duration-500`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    {/* Title and Description */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
                      {dataset.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {dataset.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-300 font-medium bg-purple-500/20 px-3 py-1 rounded-full">
                        {dataset.stats}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Data Display Section */}
        {(data || error) && (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
              {error ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">
                    Error Loading Data
                  </h3>
                  <p className="text-gray-300">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-4 px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              ) : (
                <div id="data-display">
                  {/* Table Header with Actions */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <Database className="w-6 h-6 mr-3 text-purple-400" />
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {datasets.find((d) => d.id === selectedCard)?.title ||
                            "Data Results"}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Showing {data?.length || 0} of {totalElements} records
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Export CSV
                      </button>
                      <button
                        onClick={() => setData(null)}
                        className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                      >
                        Clear Data
                      </button>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="bg-black/30 rounded-xl overflow-hidden border border-gray-700/50">
                    <div className="overflow-x-auto ">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-purple-900/20">
                          <tr>{renderTableHeaders(data)}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/30">
                          {renderTableRows(data)}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700/50">
                      <div className="text-sm text-gray-400">
                        Page {currentPage + 1} of {totalPages}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 0 || loading}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                            currentPage === 0 || loading
                              ? "bg-gray-600/20 text-gray-500 cursor-not-allowed"
                              : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages - 1 || loading}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                            currentPage >= totalPages - 1 || loading
                              ? "bg-gray-600/20 text-gray-500 cursor-not-allowed"
                              : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                          }`}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataDashboard;
