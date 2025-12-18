import fs from "fs";

// ... CONFIGURATION & HELPERS ...
const STUDENT_COUNT = 30;
const VENDOR_COUNT = 50;
const REVIEWS_PER_SHOP = 20;
const MARKETPLACE_ITEMS = 20;

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Simple random phone generator
const getRandomPhone = () => {
  return `9${Math.floor(Math.random() * 1000000000)
    .toString()
    .padStart(9, "0")}`;
};

const START_DATE = new Date("2025-11-29T00:00:00Z").getTime();
const END_DATE = new Date("2025-12-29T23:59:59Z").getTime();

const getRandomDate = () => {
  const date = new Date(getRandomInt(START_DATE, END_DATE));
  return {
    iso: date.toISOString(),
    dateStr: date.toLocaleDateString("en-US"),
    timeStr: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

// ... DATA POOLS (Names, Shops, Reviews etc.) same as before ...
const firstNames = [
  "Alex",
  "Sarah",
  "Mike",
  "Priya",
  "Rahul",
  "Emily",
  "Chen",
  "Aisha",
  "Tom",
  "Jessica",
  "David",
  "Emma",
  "Daniel",
  "Sophia",
  "James",
  "Olivia",
  "Robert",
  "Isabella",
  "William",
  "Mia",
  "Joseph",
  "Charlotte",
  "Charles",
  "Amelia",
  "Thomas",
  "Harper",
  "Christopher",
  "Evelyn",
  "Daniel",
  "Abigail",
];
const lastNames = [
  "Johnson",
  "Connor",
  "Ross",
  "Patel",
  "Sharma",
  "Blunt",
  "Wei",
  "Khan",
  "Holland",
  "Day",
  "Smith",
  "Brown",
  "Wilson",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
  "Thompson",
  "Garcia",
  "Martinez",
  "Robinson",
  "Clark",
  "Rodriguez",
  "Lewis",
  "Lee",
  "Walker",
  "Hall",
];
const shopCategories = ["Food", "Stationery", "Services", "Retail"];
const shopPrefixes = [
  "Campus",
  "Uni",
  "Student",
  "City",
  "Fast",
  "Tech",
  "Fresh",
  "Daily",
  "Super",
  "Quick",
];
const shopSuffixes = [
  "Cafe",
  "Store",
  "Point",
  "Hub",
  "Station",
  "Corner",
  "Bistro",
  "Mart",
  "Zone",
  "Spot",
];

const reviewTexts = [
  "Great service!",
  "Loved the food.",
  "Very helpful staff.",
  "A bit expensive but worth it.",
  "Quick and easy.",
  "Will come back again.",
  "Highly recommended!",
  "Average experience.",
  "Best in campus.",
  "Could be cleaner.",
  "Friendly owner.",
  "Tasty snacks.",
  "Good quality products.",
  "Saved my assignment submission!",
  "Nice ambiance.",
];

const marketItems = [
  { title: "Engineering Graphics Kit", cat: "Stationery", price: 250 },
  { title: "Scientific Calculator", cat: "Electronics", price: 600 },
  { title: "1st Year Physics Book", cat: "Books", price: 300 },
  { title: "Lab Coat (M)", cat: "Others", price: 150 },
  { title: "bicycle", cat: "Cycles/Vehicles", price: 2000 },
  { title: "Drafting Table", cat: "Stationery", price: 1200 },
  { title: "Python Notes (Handwritten)", cat: "Books", price: 50 },
];

// --- GENERATION ---
const db = {
  students: {},
  vendors: {},
  shops: {},
  reviews: {},
  marketplace_items: {},
  coin_logs: {},
};

// 1. GENERATE STUDENTS
const studentList = [];
for (let i = 1; i <= STUDENT_COUNT; i++) {
  const fname = getRandomItem(firstNames);
  const lname = getRandomItem(lastNames);
  const id = `stu_${String(i).padStart(3, "0")}`;
  const email = `${fname.toLowerCase()}.${lname.toLowerCase()}${i}@university.edu`;

  const student = {
    name: `${fname} ${lname}`,
    email: email,
    studentId: `ID-${2024000 + i}`,
    coins: getRandomInt(0, 50),
    walletBalance: getRandomInt(0, 100),
    profileImage: `https://ui-avatars.com/api/?name=${fname}+${lname}&background=random&color=fff`,
  };

  db.students[id] = student;
  studentList.push({ id, ...student });
}

// 2. GENERATE VENDORS & SHOPS
for (let i = 1; i <= VENDOR_COUNT; i++) {
  const vendorUser = `vendor_${i}`;
  const shopName = `${getRandomItem(shopPrefixes)} ${getRandomItem(
    shopSuffixes
  )} ${i}`;
  const shopId = shopName.toLowerCase().replace(/\s+/g, "_");
  const category = getRandomItem(shopCategories);

  db.vendors[vendorUser] = {
    username: vendorUser,
    password: "password123",
    storeName: shopName,
    plan: "Premium",
    joinedAt: getRandomDate().iso,
  };

  db.shops[shopId] = {
    shopId: shopId,
    shopName: shopName,
    ownerName: `Owner ${i}`,
    vendorUsername: vendorUser,
    category: category,
    description: `The best ${category.toLowerCase()} spot on campus. Serving students since 2020.`,
    specialty: "Student Specials",
    services: "Walk-in, Pre-order",
    address: `Building ${getRandomInt(1, 10)}, Shop ${i}`,
    status: "Open",
    shopImage: `https://picsum.photos/seed/${shopId}/800/400`,
    products: [
      { name: "Basic Item", price: "50" },
      { name: "Premium Item", price: "150" },
      { name: "Student Combo", price: "100" },
    ],
    createdAt: getRandomDate().iso,
  };

  // 3. REVIEWS
  db.reviews[shopId] = {};
  for (let j = 0; j < REVIEWS_PER_SHOP; j++) {
    const reviewer = getRandomItem(studentList);
    const dateInfo = getRandomDate();
    const reviewId = `rev_${shopId}_${j}`;

    db.reviews[shopId][reviewId] = {
      reviewId: reviewId,
      studentName: reviewer.name,
      studentEmail: reviewer.email,
      rating: getRandomInt(3, 5),
      text: getRandomItem(reviewTexts),
      date: dateInfo.dateStr,
      time: dateInfo.timeStr,
      timestamp: dateInfo.iso,
    };
  }

  // 4. COIN LOGS
  db.coin_logs[shopId] = {};
  const luckyStudent = getRandomItem(studentList);
  const sanitizedEmail = luckyStudent.email.replace(/[.#$[\]]/g, "_");
  db.coin_logs[shopId][sanitizedEmail] = {
    studentEmail: luckyStudent.email,
    lastCoinDate: getRandomDate().iso,
  };
}

// 5. GENERATE MARKETPLACE ITEMS
for (let i = 1; i <= MARKETPLACE_ITEMS; i++) {
  const seller = getRandomItem(studentList);
  const itemTemplate = getRandomItem(marketItems);
  const itemId = `item_${i}`;
  const dateInfo = getRandomDate();

  db.marketplace_items[itemId] = {
    id: itemId,
    title: itemTemplate.title,
    price: itemTemplate.price,
    category: itemTemplate.cat,
    description: "Used but in good condition. Contact me for details.",
    // UPDATED: Use Random Phone Number here instead of email
    contact: getRandomPhone(),
    sellerName: seller.name,
    sellerEmail: seller.email,
    image: `https://picsum.photos/seed/${itemId}/300/200`,
    timestamp: dateInfo.iso,
  };
}

fs.writeFileSync("database_export.json", JSON.stringify(db, null, 2));
console.log(
  "✅ database_export.json created successfully with PHONE NUMBERS in marketplace!"
);
