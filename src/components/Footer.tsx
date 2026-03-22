
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-agrihealth-green text-white py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">AgriHealth</h3>
            <p className="text-sm">
              Empowering farmers with advanced soil analysis and agricultural insights
              to improve crop yield and sustainability.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:underline">Home</Link></li>
              <li><Link to="/soil-report" className="text-sm hover:underline">Soil Report</Link></li>
              <li><Link to="/chatbot" className="text-sm hover:underline">AI Chatbot</Link></li>
              <li><Link to="/crop-disease" className="text-sm hover:underline">Crop Disease Detection</Link></li>
              <li><Link to="/weather" className="text-sm hover:underline">Weather</Link></li>
              <li><Link to="/contact" className="text-sm hover:underline">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <address className="not-italic text-sm">
              <p>123 Agriculture Lane</p>
              <p>Farmington, AG 12345</p>
              <p className="mt-2">Email: info@agrihealth.com</p>
              <p>Phone: (123) 456-7890</p>
            </address>
          </div>
        </div>
        <div className="border-t border-agrihealth-green-light mt-8 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} AgriHealth. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
