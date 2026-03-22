
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Loader2, FileText, TrendingUp, Layers, Plus, ArrowRight } from "lucide-react";

type SoilReport = {
  id: string;
  soil_type: string;
  location: string | null;
  created_at: string;
};

const COLORS = ["#2d6a4f", "#40916c", "#52b788", "#74c69d", "#95d5b2", "#b7e4c7"];

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<SoilReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please login to view your dashboard",
        variant: "destructive",
      });
      navigate("/login");
    } else if (user) {
      fetchReports();
    }
  }, [user, loading, navigate]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("soil_reports")
        .select("id, soil_type, location, created_at")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Compute statistics
  const totalReports = reports.length;

  const soilTypeCounts = reports.reduce((acc, report) => {
    const type = report.soil_type.charAt(0).toUpperCase() + report.soil_type.slice(1);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barChartData = Object.entries(soilTypeCounts).map(([name, count]) => ({
    name,
    reports: count,
  }));

  const pieChartData = Object.entries(soilTypeCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const mostAnalyzedSoil = barChartData.reduce(
    (max, item) => (item.reports > max.reports ? item : max),
    { name: "None", reports: 0 }
  );

  const uniqueLocations = new Set(reports.filter((r) => r.location).map((r) => r.location)).size;

  // Timeline data - reports per month
  const timelineData = reports.reduce((acc, report) => {
    const date = new Date(report.created_at);
    const month = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const existing = acc.find((item) => item.month === month);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ month, count: 1 });
    }
    return acc;
  }, [] as { month: string; count: number }[]);

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-agrihealth-green" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-agrihealth-green">Dashboard</h1>
            <p className="text-gray-500 mt-1">Your soil analysis overview and statistics</p>
          </div>
          <Button
            onClick={() => navigate("/soil-report")}
            className="bg-agrihealth-green hover:bg-agrihealth-green-light"
          >
            <Plus className="h-4 w-4 mr-2" /> New Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Reports</p>
                  <p className="text-3xl font-bold text-agrihealth-green">{totalReports}</p>
                </div>
                <FileText className="h-8 w-8 text-agrihealth-green/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Most Analyzed</p>
                  <p className="text-3xl font-bold text-agrihealth-green">{mostAnalyzedSoil.name}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-agrihealth-green/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Soil Types Tested</p>
                  <p className="text-3xl font-bold text-agrihealth-green">
                    {Object.keys(soilTypeCounts).length}
                  </p>
                </div>
                <Layers className="h-8 w-8 text-agrihealth-green/30" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Locations</p>
                  <p className="text-3xl font-bold text-agrihealth-green">{uniqueLocations}</p>
                </div>
                <div className="text-2xl text-agrihealth-green/30">📍</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {totalReports === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reports Yet</h3>
              <p className="text-gray-500 mb-6">
                Generate your first soil report to start seeing analytics here.
              </p>
              <Button
                onClick={() => navigate("/soil-report")}
                className="bg-agrihealth-green hover:bg-agrihealth-green-light"
              >
                Create Your First Report
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Reports by Soil Type</CardTitle>
                <CardDescription>Distribution of analysis across soil types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="reports" fill="#2d6a4f" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Soil Type Distribution</CardTitle>
                <CardDescription>Percentage breakdown of analyzed soil types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieChartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Timeline Chart */}
            {timelineData.length > 1 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Reports Over Time</CardTitle>
                  <CardDescription>Number of soil reports generated each month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#2d6a4f"
                        strokeWidth={2}
                        dot={{ fill: "#2d6a4f", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className={timelineData.length <= 1 ? "lg:col-span-2" : ""}>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => navigate("/soil-report")}
                  >
                    <FileText className="h-4 w-4 mr-2 text-agrihealth-green" />
                    New Soil Report
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => navigate("/crop-disease")}
                  >
                    <span className="mr-2">🔬</span> Detect Crop Disease
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => navigate("/chatbot")}
                  >
                    <span className="mr-2">🤖</span> Ask AI Assistant
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => navigate("/weather")}
                  >
                    <span className="mr-2">🌦️</span> Check Weather
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
