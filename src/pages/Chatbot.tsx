
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Send, Bot, User, Sparkles, Lightbulb } from "lucide-react";
import { chatWithAssistant, isGeminiConfigured, type ChatMessage } from "@/lib/gemini";

const suggestedPrompts = [
  "What crops grow best in clay soil?",
  "How to control aphids organically?",
  "Best irrigation methods for summer?",
  "When should I apply nitrogen fertilizer?",
  "How to improve soil drainage?",
  "What are signs of nutrient deficiency in tomato plants?",
];

const Chatbot = () => {
  const [messages, setMessages] = useState<{ role: "user" | "model"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    if (!isGeminiConfigured()) {
      toast({
        title: "API Key Required",
        description: "Please configure your Gemini API key in the .env file to use the chatbot.",
        variant: "destructive",
      });
      return;
    }

    const userMessage = { role: "user" as const, content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatWithAssistant(text, chatHistory);
      const modelMessage = { role: "model" as const, content: response };
      setMessages((prev) => [...prev, modelMessage]);
      setChatHistory((prev) => [
        ...prev,
        { role: "user", parts: text },
        { role: "model", parts: response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-lg font-bold mt-3 mb-1 text-agrihealth-green">{line.replace('## ', '')}</h2>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-semibold mt-2 mb-1">{line.replace(/\*\*/g, '')}</p>;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={index} className="ml-4 my-0.5 text-sm">{line.substring(2)}</li>;
      } else if (line.match(/^\d+\.\s/)) {
        return <div key={index} className="ml-4 my-0.5 text-sm">{line}</div>;
      } else if (line === '') {
        return <br key={index} />;
      } else {
        // Handle inline bold
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="my-1 text-sm">
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
    <div className="container mx-auto py-8 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-agrihealth-green rounded-full flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-agrihealth-green">AgriHealth AI Assistant</h1>
            <p className="text-gray-500 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Powered by Gemini AI
            </p>
          </div>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Agricultural Expert Chat</CardTitle>
            <CardDescription>
              Ask me anything about crops, soil, diseases, fertilizers, pests, and farming best practices.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 overflow-auto px-6 pb-0">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot className="h-16 w-16 text-agrihealth-green/30 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">How can I help you today?</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-md">
                  I'm your AI agricultural expert. Ask me about soil, crops, diseases, or any farming topic.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSend(prompt)}
                      className="text-left text-sm p-3 rounded-lg border border-gray-200 hover:border-agrihealth-green hover:bg-agrihealth-green/5 transition-colors flex items-start gap-2"
                    >
                      <Lightbulb className="h-4 w-4 text-agrihealth-green shrink-0 mt-0.5" />
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "model" && (
                      <div className="w-8 h-8 bg-agrihealth-green rounded-full flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-agrihealth-green text-white rounded-br-md"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <p className="text-sm">{msg.content}</p>
                      ) : (
                        <div>{renderMarkdown(msg.content)}</div>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-agrihealth-green rounded-full flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-agrihealth-green" />
                        <span className="text-sm text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about crops, soil, diseases, fertilizers..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="bg-agrihealth-green hover:bg-agrihealth-green-light"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chatbot;
