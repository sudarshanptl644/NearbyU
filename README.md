# 🎓 NearbyU

> **Hyperlocal Services & Marketplace Discovery App for University Students**

**NearbyU** is a comprehensive web platform connecting university students with local vendors. It features a peer-to-peer "Buy & Sell" marketplace for trading academic items and a dedicated dashboard for local shopkeepers to manage their digital presence.

---

## 🚀 Features

### 👤 For Students
* **Marketplace:** A dedicated "Buy & Sell" hub to trade items with peers.
    * **Sell Item:** List used books, notes, or gadgets.
    * **Favorites:** Save items or shops for later.
* **Vendor Discovery:** Browse local shops, view details, and explore categories.
* **Profile Management:** Custom user profiles and preferences.

### 🏪 For Vendors
* **Vendor Dashboard:** A central hub to view business stats.
* **Shop Management:** Register new shops or edit existing details.
* **Subscription System:** integrated subscription plans and payment gateways.

---

## 🛠️ Tech Stack

This project is built using the **MERN** philosophy (using Firebase for the backend) and modern tooling.

* **Frontend:** [React 19](https://react.dev/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & PostCSS
* **Routing:** React Router DOM v7
* **Backend:** [Firebase](https://firebase.google.com/) (Realtime Database & Auth)
* **Quality:** ESLint

---

## 📂 Project Structure

```bash
nearbyU/
├── src/
│   ├── components/
│   │   ├── login.jsx            # Auth Entry
│   │   ├── studentHome.jsx      # Student Landing Page
│   │   ├── marketPlace.jsx      # Buy & Sell Hub
│   │   ├── sellItem.jsx         # Item Listing Form
│   │   ├── vendorDashboard.jsx  # Vendor Stats & Controls
│   │   ├── PaymentGateway.jsx   # Mock Payment Processing
│   │   └── ...
│   ├── App.jsx                  # Main Routes
│   ├── main.jsx                 # Entry Point
│   └── firebase.js              # Firebase Config
├── public/
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## ⚙️ Installation & Setup
Follow these steps to run the project locally.

### 1. Clone the Repository
Bash

git clone [https://github.com/your-username/nearbyU.git](https://github.com/your-username/nearbyU.git)
cd nearbyU
### 2. Install Dependencies
Bash

npm install
### 3. Configure Firebase
Create a project on the Firebase Console.

Enable Authentication and Realtime Database.

Add your Firebase configuration keys to src/firebase.js.

### 4. Run the Development Server
Bash

**npm run dev**
The app will start on http://localhost:5173 (or the port shown in your terminal).

 ## 📜 Available Scripts
**npm run dev**: Starts the development server.

**npm run build**: Builds the app for production.

**npm run lint**: Runs ESLint to check for code quality.

**npm run preview**: Preview the production build locally.

## 📝 License
This project is created for educational purposes as a University Mini-Project.

Made with ❤️ using React & Tailwind