# 🕌 WAHDATH — Your Muslim Companion

**WAHDATH** is a modern digital companion for Muslims in Sri Lanka, designed to bring essential Islamic tools and resources together in one accessible web application.

The project combines **prayer times, Quran, Hadith, Qibla, Tasbih, Ramadan tools, Islamic calendar features, notifications, and an AI-powered Quran assistant** into a single platform.

> **A Digital Companion for Muslims in Sri Lanka.**

---

## ✨ Features

### 🕋 Prayer Times

* Daily prayer time dashboard
* Fajr, Dhuhr, Asr, Maghrib and Isha
* Live **Next Prayer** countdown
* Automatic transition to the next day's Fajr
* Sri Lankan province, district and city selection
* Support for all **25 districts of Sri Lanka**
* Eastern Province prayer-time adjustment
* Daily and monthly prayer timetable
* Prayer status highlighting
* Prayer notifications
* Adhan support

### 📖 Quran

* Complete Quran with **114 Surahs**
* Arabic Quran text
* English translation
* Quran search
* Surah navigation
* Ayah-by-ayah reading
* Bookmarks
* Last-read progress
* Adjustable Quran font size
* Dark reading experience
* Quran sharing

### 🤖 AI Quran Assistant

WAHDATH includes an AI-powered Quran assistant designed to help users explore Quranic guidance.

The assistant is designed around:

* Quran-based answers
* Relevant Ayah references
* Contextual explanations
* Source-based responses
* Retrieval-augmented generation (RAG) architecture
* Protection against fabricated Quran references

The AI assistant is intended as an educational tool and **not as a replacement for qualified Islamic scholars or Muftis**.

---

## 🧭 Qibla Finder

* Uses device geolocation
* Calculates Qibla direction
* Displays the bearing toward the Kaaba
* Supports location permission handling
* Provides fallback options when location access is unavailable

---

## 📿 Tasbih

Digital Dhikr counter with:

* Tap-to-count functionality
* Persistent counter
* Common Dhikr presets
* Reset functionality
* Optional vibration feedback

---

## 🌙 Ramadan

Ramadan-focused tools including:

* Suhoor information
* Iftar information
* Fasting countdown
* Ramadan timetable
* Daily fasting status
* Ramadan reminders

---

## 📅 Islamic Calendar

* Hijri date
* Gregorian date
* Islamic events
* Important Islamic dates
* Ramadan date information

> Islamic calendar calculations may be approximate where official lunar-calendar announcements are required.

---

## 🔔 Notifications

WAHDATH supports prayer-related notifications including:

* Prayer reminders
* Adhan notifications
* Browser notification permissions
* Configurable notification preferences
* Push notification support

---

## 👨‍💻 Admin Dashboard

The admin system provides tools for managing prayer data.

Features include:

* Prayer timetable management
* CSV import
* Prayer-time validation
* Data preview
* Location-based timetable management
* Publishing updated prayer data

This allows prayer timetables to be updated without modifying the application source code.

---

## 🌍 Sri Lankan Location Support

WAHDATH is designed specifically for Sri Lanka.

The location system supports the country's:

* 9 Provinces
* 25 Districts
* Multiple cities and towns

The prayer system is structured so that location-specific timetables can be maintained independently.

---

## 🎨 UI & UX

WAHDATH follows a modern, responsive design philosophy.

### Design goals

* 📱 Mobile-first
* 💻 Desktop responsive
* 🌙 Dark mode
* ☀️ Light mode
* ⚡ Fast interactions
* 🎞️ Smooth animations
* ♿ Accessible interface
* 🕌 Modern Islamic visual identity
* 🌐 Multilingual-ready architecture

---

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* Framer Motion

### Backend

* Node.js
* Express.js

### Data & Services

* Quran data
* Prayer timetable data
* Geolocation APIs
* Browser Notifications
* Web Push
* AI/RAG services

### Deployment

Designed for deployment using:

* Vercel
* Node.js-compatible backend hosting
* Supabase / PostgreSQL for production data services

---

## 📂 Project Structure

```text
WAHDATH/
│
├── public/
│   ├── icons/
│   ├── images/
│   └── ...
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── data/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── ...
│
├── server/
│   ├── routes/
│   ├── services/
│   └── ...
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── tailwind.config.js
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* Git

Check your installation:

```bash
node -v
npm -v
git --version
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/WAHDATH.git
```

Enter the project:

```bash
cd WAHDATH
```

Install dependencies:

```bash
npm install
```

---

## ▶️ Run the Application

### Frontend

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

### Backend

In a second terminal:

```bash
npm run dev:server
```

The backend normally runs on:

```text
http://localhost:8787
```

### Run Frontend + Backend Together

If configured in `package.json`, you can use:

```bash
npm run dev:full
```

---

# 🔐 Environment Variables

Some features may require environment variables.

Create a local `.env` file:

```env
# Example

SUPABASE_URL=
SUPABASE_ANON_KEY=

OPENAI_API_KEY=

VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

**Never commit your real API keys or secrets to GitHub.**

Use `.env.example` for documenting required variables:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
OPENAI_API_KEY=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

---

# 🧪 Testing

Before deploying changes, test the major application functions:

* Prayer time calculation
* Next Prayer detection
* Countdown timer
* Midnight → next-day Fajr transition
* Eastern Province adjustment
* Location selection
* Quran search
* Quran bookmarks
* Qibla calculation
* Tasbih counter
* Ramadan calculations
* Notification permissions
* Admin CSV validation
* AI Quran references

---

# 🕌 Prayer Time Data

Prayer times are particularly important because they are location and date dependent.

WAHDATH uses structured prayer-time data so that timetables can be updated independently of the frontend application.

For production use, prayer times should be verified against **reliable and authoritative Sri Lankan Islamic prayer timetables** for each supported location.

The application should not assume that a timetable from one city is automatically exact for every city in Sri Lanka.

---

# 🤖 AI Safety

The WAHDATH AI Quran Assistant is designed to provide Quran-related educational assistance.

The system should:

* Provide Surah and Ayah references
* Use verified source material
* Avoid inventing Quran verses
* Clearly distinguish Quran text from explanations
* Avoid presenting unsupported religious rulings as authoritative
* Encourage consultation with qualified scholars for complex Islamic legal questions

---

# 🔒 Security

Security is an important part of the project.

Production deployments should include:

* Server-side API keys
* Environment variables
* Input validation
* Rate limiting
* Secure authentication
* Database access policies
* Role-based admin access
* Protection against unauthorized timetable modification
* Proper CORS configuration
* Secure API endpoints

---

# 📱 Progressive Web App

WAHDATH is designed to support Progressive Web App functionality.

Potential PWA capabilities include:

* Install WAHDATH on mobile
* Offline access
* Cached application resources
* Fast loading
* App-like experience
* Notification support

---

# 🗺️ Roadmap

### ✅ Current

* [x] React/Vite application
* [x] Prayer time system
* [x] Next Prayer countdown
* [x] Sri Lankan location structure
* [x] Quran
* [x] Quran search
* [x] Bookmarks
* [x] Qibla
* [x] Tasbih
* [x] Ramadan tools
* [x] Islamic calendar
* [x] Admin functionality
* [x] AI Quran Assistant architecture
* [x] PWA foundation

### 🚧 Future

* [ ] Fully verified location-specific Sri Lankan prayer timetables
* [ ] Sinhala Quran translation
* [ ] Tamil Quran translation
* [ ] Quran audio
* [ ] Multiple Qari options
* [ ] Advanced Quran Tafsir
* [ ] Scholar-reviewed AI responses
* [ ] User accounts
* [ ] Cloud-synchronized bookmarks
* [ ] Personalized prayer notifications
* [ ] Advanced Ramadan planner
* [ ] Community features
* [ ] Native Android application
* [ ] iOS application

---

# 🤝 Contributing

Contributions are welcome.

### 1. Fork the repository

```bash
git clone https://github.com/YOUR-USERNAME/WAHDATH.git
```

### 2. Create a branch

```bash
git checkout -b feature/your-feature
```

### 3. Make your changes

### 4. Commit

```bash
git add .
git commit -m "Add your feature"
```

### 5. Push

```bash
git push origin feature/your-feature
```

### 6. Create a Pull Request

Please make sure your changes are tested before submitting a pull request.

---

# 📄 License

This project is currently intended as an educational and development project.

If this repository is later released publicly, an appropriate open-source license should be added based on the project's Quran, translation, API, and third-party data licensing requirements.

---

# 👨‍💻 Project

**WAHDATH — Your Muslim Companion**

Built with ❤️ for Muslims in Sri Lanka.

> **Prayer. Quran. Guidance. One Companion.**

---

### ⚠️ Disclaimer

WAHDATH is a technology project intended to provide convenient access to Islamic resources and tools.

Prayer times, Islamic dates, Quran translations, and AI-generated explanations should be verified against trusted and authoritative sources where appropriate.

The AI Quran Assistant does not replace a qualified Islamic scholar or Mufti.
