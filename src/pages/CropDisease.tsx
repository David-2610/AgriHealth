
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, Camera, ImageIcon, Sparkles, X } from "lucide-react";
import { analyzeCropImage, isGeminiConfigured } from "@/lib/gemini";

const CropDisease = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (JPG, PNG, etc.).",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImage(dataUrl);
      // Extract base64 data without the prefix
      const base64 = dataUrl.split(",")[1];
      setImageBase64(base64);
      setMimeType(file.type);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;

    if (!isGeminiConfigured()) {
      toast({
        title: "API Key Required",
        description: "Please configure your Gemini API key in the .env file.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const analysis = await analyzeCropImage(imageBase64, mimeType);
      setResult(analysis);
      toast({
        title: "Analysis Complete",
        description: "Your crop disease analysis is ready.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImageBase64("");
    setMimeType("");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-agrihealth-green">{line.replace('## ', '')}</h2>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <h3 key={index} className="text-lg font-semibold mt-3 mb-1">{line.replace(/\*\*/g, '')}</h3>;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={index} className="ml-4 my-1">{line.substring(2)}</li>;
      } else if (line.match(/^\d+\.\s/)) {
        return <div key={index} className="ml-4 my-1">{line}</div>;
      } else if (line === '') {
        return <br key={index} />;
      } else {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="my-1">
            {parts.map((part, i) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={i}>{part.replace(/\*\*/g, '')}</strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }
    });
  };

  return (
    <div className="container mx-auto py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-agrihealth-green">
          Crop Disease Detection
        </h1>
        <p className="text-gray-500 flex items-center gap-1 mb-6">
          <Sparkles className="h-3.5 w-3.5" /> Powered by Gemini Vision AI
        </p>
        <p className="text-lg mb-8 text-gray-600">
          Upload a photo of your crop or plant leaf, and our AI will identify any
          diseases and provide treatment recommendations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" /> Upload Crop Image
                </CardTitle>
                <CardDescription>
                  Take a clear photo of the affected leaf or plant part
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!image ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? "border-agrihealth-green bg-agrihealth-green/5"
                        : "border-gray-300 hover:border-agrihealth-green"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Drag and drop an image here
                    </p>
                    <p className="text-xs text-gray-500 mb-4">or click to browse files</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-agrihealth-green text-agrihealth-green"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={image}
                        alt="Uploaded crop"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="w-full bg-agrihealth-green hover:bg-agrihealth-green-light"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          AI is analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Analyze for Diseases
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-agrihealth-green font-bold">•</span>
                    Take a clear, well-lit photo of the affected area
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-agrihealth-green font-bold">•</span>
                    Include both healthy and affected parts for comparison
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-agrihealth-green font-bold">•</span>
                    Focus on leaves as they show symptoms earliest
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-agrihealth-green font-bold">•</span>
                    Avoid blurry or dark images for accurate analysis
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <Card className={`${!result && !isAnalyzing ? "flex items-center justify-center" : ""}`}>
            <CardHeader>
              <CardTitle>Disease Analysis Results</CardTitle>
              <CardDescription>AI-powered crop health assessment</CardDescription>
            </CardHeader>
            <CardContent className="overflow-auto max-h-[600px]">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-agrihealth-green mb-4" />
                  <p className="text-gray-500">AI is analyzing your crop image...</p>
                  <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
                </div>
              ) : result ? (
                <div className="prose max-w-none">{renderMarkdown(result)}</div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Upload a crop image to get disease analysis and treatment recommendations.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CropDisease;
