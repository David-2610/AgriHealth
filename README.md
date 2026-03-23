# 🌿 AgriHealth: Smart Agricultural Support System

AgriHealth is a cutting-edge agricultural decision-support platform designed to empower farmers with AI-driven insights. By combining advanced soil analysis, real-time weather monitoring, and computer vision for crop disease detection, AgriHealth helps maximize yields and promote sustainable farming practices.

---

## ✨ Key Features

### 🧪 AI-Powered Soil Analysis
Get comprehensive reports on your soil's health. Input your soil type and location to receive specialized recommendations for crop selection, pH management, and fertilizer schedules.

### 🔍 Crop Disease Detection
Leveraging **Gemini Vision AI**, farmers can upload photos of plant leaves to identify diseases instantly. The system provides immediate treatment plans and prevention strategies to save your harvest.

### 🌤️ Smart Weather Station
localized, real-time weather data integrated with AI farming advice. Get proactive recommendations based on upcoming forecasts to plan your irrigation and crop protection activities efficiently.

### 🤖 AgriBot Assistant
A specialized AI chatbot that acts as a 24/7 agricultural consultant. Ask questions about pest control, irrigation techniques, or farming best practices in natural language.

### 📊 Personalized Dashboard
Securely store and track your historical soil reports and disease analysis. Monitor your farm's health trends over time with an intuitive, data-driven interface.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Lucide Icons, Shadcn UI |
| **AI / ML** | Google Gemini 2.5 Flash, Gemini Vision AI |
| **Backend / Auth** | Supabase (PostgreSQL, Edge Functions, Auth, Storage) |
| **State Management** | TanStack Query (React Query) |
| **Data Viz** | Recharts |
| **Weather Data** | Open-Meteo API |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Supabase Project
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/david-2610/agrihealth.git
   cd agrihealth
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```sh
   npm run dev
   ```

---

## 📂 Project Structure

```text
agrihealth/
├── src/
│   ├── components/      # Reusable UI components (Shadcn)
│   ├── contexts/        # Auth & App state management
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # API services (Gemini, Weather, Supabase)
│   ├── pages/           # Feature-specific views
│   └── integrations/    # External service configurations
├── supabase/            # Database migrations & configuration
├── public/              # Static assets
└── tailwind.config.ts   # Design system configuration
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for feature requests.

## 📄 License

This project is licensed under the MIT License.

---
Built with ❤️ for the future of farming.
