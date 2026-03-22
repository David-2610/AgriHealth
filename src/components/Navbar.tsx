
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, FileText, Bot, Leaf, BarChart3, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Soil Report", path: "/soil-report" },
    { name: "Weather", path: "/weather" },
    { name: "Contact", path: "/contact" },
  ];

  const aiToolLinks = [
    { name: "AI Chatbot", path: "/chatbot", icon: Bot },
    { name: "Crop Disease Detection", path: "/crop-disease", icon: Leaf },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-agrihealth-green py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <div className="text-agrihealth-green text-lg font-bold">AH</div>
          </div>
          <span className="text-white text-xl font-bold">AgriHealth</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-white hover:text-agrihealth-cream transition-colors ${
                location.pathname === link.path
                  ? "font-bold border-b-2 border-white"
                  : ""
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* AI Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-1 text-white hover:text-agrihealth-cream transition-colors ${
                  ["/chatbot", "/crop-disease"].includes(location.pathname)
                    ? "font-bold border-b-2 border-white"
                    : ""
                }`}
              >
                AI Tools <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {aiToolLinks.map((link) => (
                <DropdownMenuItem key={link.path} onClick={() => navigate(link.path)}>
                  <link.icon className="mr-2 h-4 w-4" /> {link.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white text-agrihealth-green hover:bg-agrihealth-cream">
                  <User className="mr-2 h-4 w-4" />
                  {user.email?.split('@')[0] || "Account"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <BarChart3 className="mr-2 h-4 w-4" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/account")}>
                  <FileText className="mr-2 h-4 w-4" /> My Soil Reports
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button className="bg-white text-agrihealth-green hover:bg-agrihealth-cream">
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-agrihealth-green border-t border-agrihealth-green-light mt-4">
          <div className="container mx-auto py-4 px-6 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-white hover:text-agrihealth-cream transition-colors ${
                  location.pathname === link.path ? "font-bold" : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            <div className="border-t border-agrihealth-green-light pt-2">
              <p className="text-agrihealth-cream text-xs uppercase tracking-wide mb-2">AI Tools</p>
              {aiToolLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-white hover:text-agrihealth-cream transition-colors block py-1"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            {user ? (
              <>
                <div className="border-t border-agrihealth-green-light pt-2">
                  <Link 
                    to="/dashboard" 
                    className="text-white hover:text-agrihealth-cream transition-colors block py-1"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/account" 
                    className="text-white hover:text-agrihealth-cream transition-colors block py-1"
                    onClick={() => setIsOpen(false)}
                  >
                    My Soil Reports
                  </Link>
                </div>
                <Button 
                  variant="outline" 
                  className="bg-white text-agrihealth-green hover:bg-agrihealth-cream"
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </Button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-white text-agrihealth-green hover:bg-agrihealth-cream">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
