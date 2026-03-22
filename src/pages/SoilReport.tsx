
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { generateSoilReport as geminiGenerateReport, isGeminiConfigured } from "@/lib/gemini";

const SoilReport = () => {
  const [soilType, setSoilType] = useState("");
  const [location, setLocation] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!soilType) {
      toast({
        title: "Missing information",
        description: "Please select a soil type.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to generate and save soil reports.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setReport(null);

    try {
      let generatedReport: string;
      
      if (isGeminiConfigured()) {
        // Use Gemini AI for report generation
        generatedReport = await geminiGenerateReport(soilType, location, additionalInfo);
      } else {
        // Fallback to mock report if API key is not set
        generatedReport = generateMockSoilReport(soilType);
        toast({
          title: "Using sample data",
          description: "Gemini API key not configured. Showing a sample report.",
        });
      }
      
      setReport(generatedReport);
      
      // Save the report to Supabase
      const { error } = await supabase.from('soil_reports').insert({
        user_id: user.id,
        soil_type: soilType,
        location: location || null,
        additional_info: additionalInfo || null,
        report_content: generatedReport
      });

      if (error) {
        throw new Error(error.message || "Failed to save soil report");
      }
      
      toast({
        title: "Report Generated",
        description: isGeminiConfigured()
          ? "Your AI-powered soil analysis report is ready and saved."
          : "Sample report saved to your account.",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate soil report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback mock report generator
  const generateMockSoilReport = (soilType: string) => {
    const reports: Record<string, string> = {
      clay: `## Clay Soil Analysis Report\n\n**Soil Composition:**\nClay soil contains fine particles with high mineral content including calcium, potassium, and magnesium.\n\n**Key Characteristics:**\n- Holds water well, sometimes too well\n- Slow to warm in spring\n- Can become compacted easily\n- High in nutrients\n\n**Best Crops:**\n- Cabbage and broccoli\n- Tomatoes and peppers\n- Perennial flowers\n- Fruit trees\n\n**Improvement Strategies:**\n- Add organic matter regularly\n- Avoid working when wet\n- Consider raised beds\n- Add grit or sand for better structure\n\n**Optimal pH Range:** 6.0-7.0\n\n**Recommended Fertilizers:**\n- Organic compost\n- Well-rotted manure\n- Gypsum to improve structure`,
      sandy: `## Sandy Soil Analysis Report\n\n**Soil Composition:**\nSandy soil consists of larger particles with significant space between them.\n\n**Key Characteristics:**\n- Drains quickly\n- Warms up fast in spring\n- Easy to work with\n- Lower in nutrients\n\n**Best Crops:**\n- Root vegetables like carrots and potatoes\n- Mediterranean herbs\n- Drought-tolerant plants\n- Melons and strawberries\n\n**Improvement Strategies:**\n- Add plenty of organic matter\n- Use mulch to retain moisture\n- Use slow-release fertilizers\n\n**Optimal pH Range:** 5.5-6.5\n\n**Recommended Fertilizers:**\n- Compost with high organic matter\n- Kelp meal\n- Worm castings`,
      loam: `## Loam Soil Analysis Report\n\n**Soil Composition:**\nLoam soil is a balanced mixture of sand, silt, and clay with good organic matter.\n\n**Key Characteristics:**\n- Excellent drainage while retaining moisture\n- Easy to work with\n- Good nutrient retention\n\n**Best Crops:**\n- Almost all garden vegetables\n- Most flowers and ornamentals\n- Fruit trees and berries\n\n**Improvement Strategies:**\n- Maintain with regular compost additions\n- Rotate crops annually\n- Use cover crops in winter\n\n**Optimal pH Range:** 6.0-7.0\n\n**Recommended Fertilizers:**\n- Balanced organic fertilizers\n- Compost\n- Aged manure`,
      silt: `## Silty Soil Analysis Report\n\n**Soil Composition:**\nSilty soil contains medium-sized particles that hold water well.\n\n**Key Characteristics:**\n- Retains moisture well\n- Fertile with good nutrients\n- Can form crust when dry\n\n**Best Crops:**\n- Moisture-loving perennials\n- Leafy greens\n- Shrubs and climbers\n\n**Improvement Strategies:**\n- Add organic matter\n- Use mulch to prevent crusting\n- Consider raised beds\n\n**Optimal pH Range:** 6.0-7.0\n\n**Recommended Fertilizers:**\n- Balanced organic matter\n- Aged compost\n- Fish emulsion`,
      peaty: `## Peaty Soil Analysis Report\n\n**Soil Composition:**\nPeaty soil is rich in organic matter with high water retention.\n\n**Key Characteristics:**\n- Excellent water retention\n- Acidic pH typically\n- High in decomposed organic material\n\n**Best Crops:**\n- Blueberries\n- Acid-loving vegetables\n- Rhododendrons\n\n**Improvement Strategies:**\n- Add lime to adjust pH\n- Improve drainage\n- Add balanced minerals\n\n**Optimal pH Range:** 4.5-6.0\n\n**Recommended Fertilizers:**\n- Balanced minerals\n- Rock dust\n- Seaweed extracts`,
      chalky: `## Chalky Soil Analysis Report\n\n**Soil Composition:**\nChalky soil contains calcium carbonate, making it alkaline.\n\n**Key Characteristics:**\n- Free-draining\n- Warms up quickly\n- Prone to nutrient deficiencies\n\n**Best Crops:**\n- Mediterranean herbs\n- Lavender\n- Spinach and beets\n\n**Improvement Strategies:**\n- Add organic matter regularly\n- Mulch heavily\n- Consider raised beds\n\n**Optimal pH Range:** 7.0-8.0\n\n**Recommended Fertilizers:**\n- Organic matter high in acidity\n- Sulfur for acid-loving plants\n- Iron supplements`,
    };
    return reports[soilType] || `## General Soil Analysis Report\n\n**Note:** General report for unrecognized soil type.\n\n**Recommended Actions:**\n- Get a professional soil test\n- Add organic matter\n- Monitor plant growth`;
  };

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-agrihealth-green">Soil Analysis Report</h1>
        <div className="flex items-center gap-2 mb-6">
          {isGeminiConfigured() && (
            <span className="inline-flex items-center gap-1 text-sm bg-agrihealth-green/10 text-agrihealth-green px-3 py-1 rounded-full">
              <Sparkles className="h-3.5 w-3.5" /> Powered by Gemini AI
            </span>
          )}
        </div>
        <p className="text-lg mb-8 text-gray-600">
          Enter information about your soil to receive a detailed analysis and
          recommendations for optimal farming practices.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Soil Information</CardTitle>
              <CardDescription>
                Provide details about your soil for analysis
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="soil-type">Soil Type *</Label>
                  <Select value={soilType} onValueChange={setSoilType}>
                    <SelectTrigger id="soil-type">
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clay">Clay Soil</SelectItem>
                      <SelectItem value="sandy">Sandy Soil</SelectItem>
                      <SelectItem value="loam">Loam Soil</SelectItem>
                      <SelectItem value="silt">Silty Soil</SelectItem>
                      <SelectItem value="peaty">Peaty Soil</SelectItem>
                      <SelectItem value="chalky">Chalky Soil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="e.g., North field, South slope"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additional-info">Additional Information (Optional)</Label>
                  <Textarea
                    id="additional-info"
                    placeholder="Describe any issues you've observed, crops you want to grow, etc."
                    rows={4}
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-agrihealth-green hover:bg-agrihealth-green-light"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isGeminiConfigured() ? "AI is analyzing..." : "Analyzing..."}
                    </>
                  ) : (
                    <>
                      {isGeminiConfigured() && <Sparkles className="mr-2 h-4 w-4" />}
                      Generate Report
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <div>
            <Card className={`h-full ${!report && !isLoading ? "flex items-center justify-center" : ""}`}>
              <CardHeader>
                <CardTitle>Soil Analysis Results</CardTitle>
                <CardDescription>
                  {isGeminiConfigured() ? "AI-powered recommendations" : "Recommendations"} based on your soil information
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto max-h-[500px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="h-10 w-10 animate-spin text-agrihealth-green mb-4" />
                    <p className="text-gray-500">
                      {isGeminiConfigured() ? "AI is analyzing your soil data..." : "Analyzing soil data..."}
                    </p>
                  </div>
                ) : report ? (
                  <div className="prose max-w-none">
                    {report.split('\n').map((line, index) => {
                      if (line.startsWith('##')) {
                        return <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-agrihealth-green">{line.replace('##', '')}</h2>;
                      } else if (line.startsWith('**') && line.endsWith('**')) {
                        return <h3 key={index} className="text-lg font-semibold mt-3 mb-1">{line.replace(/\*\*/g, '')}</h3>;
                      } else if (line.startsWith('-')) {
                        return <li key={index} className="ml-4 my-1">{line.substring(2)}</li>;
                      } else if (line.match(/^\d\./)) {
                        return <div key={index} className="ml-4 my-1">{line}</div>;
                      } else if (line === '') {
                        return <br key={index} />;
                      } else {
                        return <p key={index} className="my-2">{line}</p>;
                      }
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <p>Select a soil type and generate a report to see recommendations.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilReport;
