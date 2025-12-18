🎓 NearbyU
Hyperlocal Services & Marketplace Discovery App for University Students

NearbyU is a comprehensive web platform built to connect university students with local vendors and facilitate a peer-to-peer marketplace. It allows students to discover nearby shops, subscribe to services, and buy/sell used academic items, while giving vendors a dashboard to manage their digital storefronts.

🚀 Features
👤 For Students
Marketplace: A dedicated "Buy & Sell" section to trade items with other students.

Sell Item: Easy-to-use form to list used books, notes, or gadgets.

Favorites: Save items or shops for quick access later.

Vendor Discovery: Browse local shops, view details, and explore categories.

Profile Management: Manage personal details and preferences.

🏪 For Vendors
Vendor Dashboard: A central hub to view business stats and manage the shop.

Shop Management: Register new shops or edit existing shop details.

Subscription Model: Vendors can subscribe to premium plans via a built-in payment flow.

Payment Gateway: Integrated mock payment selection and processing.

🛠️ Tech Stack
This project is built using the MERN stack philosophy (replacing Mongo/Express with Firebase) and modern frontend tooling.

Frontend Framework: React 19

Build Tool: Vite

Styling: Tailwind CSS v4 & PostCSS

Routing: React Router DOM v7

Backend as a Service: Firebase (v12.6.0)

Linting: ESLint (with React Hooks & Refresh plugins)

📂 Project Structure
Bash

nearbyU/
├── public/
├── src/
│   ├── components/
│   │   ├── login.jsx            # Authentication entry point
│   │   ├── studentHome.jsx      # Main landing for students
│   │   ├── marketPlace.jsx      # Buy & Sell hub
│   │   ├── sellItem.jsx         # Form to list new items
│   │   ├── vendorDashboard.jsx  # Vendor analytics & controls
│   │   ├── SubscriptionPage.jsx # Vendor subscription plans
│   │   ├── PaymentGateway.jsx   # Payment processing simulation
│   │   └── ...
│   ├── App.jsx                  # Main routing configuration
│   └── main.jsx                 # Application entry point
├── package.json                 # Dependencies & scripts
├── tailwind.config.js           # Tailwind styling configuration
└── vite.config.js               # Vite build configuration
⚙️ Installation & Setup
Follow these steps to run the project locally.

1. Clone the Repository
Bash

git clone https://github.com/your-username/nearbyU.git
cd nearbyU
2. Install Dependencies
Bash

npm install
3. Configure Firebase
Create a project on the Firebase Console.

Enable Authentication and Realtime Database.

Add your Firebase configuration keys to src/firebase.js (or created .env file).

4. Run the Development Server
Bash

npm run dev
The app will start on http://localhost:5173 (default Vite port).

📜 Available Scripts
In the project directory, you can run:

npm run dev: Starts the development server.

npm run build: Builds the app for production.

npm run lint: Runs ESLint to check for code quality issues.

npm run preview: Locally preview the production build.

📝 License
This project is created for educational purposes as a University Mini-Project.

Made with ❤️ using React & Tailwind