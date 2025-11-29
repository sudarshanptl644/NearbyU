import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  ref,
  update,
  query,
  orderByChild,
  equalTo,
  get,
  set,
} from "firebase/database";
import Navbar from "./navbar";
import "../CSS/student.css";
import "../CSS/profile.css";

const Profile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialUserData = location.state?.userData;
  const [userData, setUserData] = useState(initialUserData);
  const [loading, setLoading] = useState(true);

  const [myShop, setMyShop] = useState(null);
  const [rewardEmail, setRewardEmail] = useState("");
  const [rewardLoading, setRewardLoading] = useState(false);

  const isVendor = !!userData?.storeName || userData?.isVendor === true;

  useEffect(() => {
    if (!initialUserData) {
      navigate("/");
      return;
    }

    const fetchProfileData = async () => {
      try {
        const collection = isVendor ? "vendors" : "students";
        const userRef = ref(db, collection);
        const searchKey =
          initialUserData.originalVendorData?.username ||
          initialUserData.username ||
          initialUserData.email;
        const searchField = isVendor ? "username" : "email";

        const q = query(userRef, orderByChild(searchField), equalTo(searchKey));
        const snapshot = await get(q);

        if (snapshot.exists()) {
          const val = snapshot.val();
          const key = Object.keys(val)[0];
          setUserData({ ...val[key], key });
        }

        if (isVendor) {
          const username =
            initialUserData.originalVendorData?.username ||
            initialUserData.username;
          const shopsRef = ref(db, "shops");
          const shopQuery = query(
            shopsRef,
            orderByChild("vendorUsername"),
            equalTo(username)
          );
          const shopSnapshot = await get(shopQuery);

          if (shopSnapshot.exists()) {
            const sData = shopSnapshot.val();
            const sKey = Object.keys(sData)[0];
            setMyShop(sData[sKey]);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [initialUserData, isVendor, navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setUserData({ ...userData, profileImage: base64 });
      if (userData.key) {
        const collection = isVendor ? "vendors" : "students";
        const userRef = ref(db, `${collection}/${userData.key}`);
        await update(userRef, { profileImage: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = async () => {
    if (window.confirm("Remove profile picture?")) {
      setUserData({ ...userData, profileImage: null });
      if (userData.key) {
        const collection = isVendor ? "vendors" : "students";
        const userRef = ref(db, `${collection}/${userData.key}`);
        await update(userRef, { profileImage: null });
      }
    }
  };

  const handleRedeem = async () => {
    if (userData.coins >= 10 && userData.key) {
      await update(ref(db, `students/${userData.key}`), {
        coins: userData.coins - 10,
      });
      setUserData({ ...userData, coins: userData.coins - 10 });
      alert("🎉 Coupon Redeemed! Code: SAVE10-NEARBYU");
    }
  };

  // Helper: Check if date is within 30 days
  const isWithinMonth = (isoDate) => {
    if (!isoDate) return false;
    const date = new Date(isoDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date > thirtyDaysAgo;
  };

  // --- STRICT COIN GIVING LOGIC ---
  const handleGiveCoin = async () => {
    if (!rewardEmail.trim()) return;
    if (!myShop) {
      alert("Error: Shop details not loaded.");
      return;
    }

    setRewardLoading(true);
    const studentEmailTrimmed = rewardEmail.trim();

    try {
      // 1. Verify Student Exists
      const studentsRef = ref(db, "students");
      const q = query(
        studentsRef,
        orderByChild("email"),
        equalTo(studentEmailTrimmed)
      );
      const studentSnap = await get(q);

      if (!studentSnap.exists()) {
        alert("Student not found. Please check the email address.");
        setRewardLoading(false);
        return;
      }

      const studentData = studentSnap.val();
      const studentKey = Object.keys(studentData)[0];
      const currentCoins = studentData[studentKey].coins || 0;

      // 2. CHECK: Has Student Reviewed this Shop recently?
      const reviewsRef = ref(db, `reviews/${myShop.shopId}`);
      const reviewsSnap = await get(reviewsRef);

      let hasValidReview = false;
      if (reviewsSnap.exists()) {
        const allReviews = Object.values(reviewsSnap.val());
        // Find review from this email AND within last 30 days
        const validReview = allReviews.find(
          (r) =>
            r.studentEmail === studentEmailTrimmed && isWithinMonth(r.timestamp)
        );
        if (validReview) hasValidReview = true;
      }

      if (!hasValidReview) {
        alert(
          `❌ REJECTED: This student has not written a review for ${myShop.shopName} in the last 30 days.`
        );
        setRewardLoading(false);
        return;
      }

      // 3. CHECK: Has Vendor already given a coin this month?
      // We use a sanitized email key to store log (replace . with ,)
      const sanitizedEmail = studentEmailTrimmed.replace(/\./g, ",");
      const coinLogRef = ref(
        db,
        `coin_logs/${myShop.shopId}/${sanitizedEmail}`
      );
      const coinLogSnap = await get(coinLogRef);

      if (coinLogSnap.exists()) {
        const lastCoinDate = coinLogSnap.val().lastCoinDate;
        if (isWithinMonth(lastCoinDate)) {
          alert(
            "❌ REJECTED: You have already given a coin to this student this month."
          );
          setRewardLoading(false);
          return;
        }
      }

      // 4. SUCCESS: Update Coin & Log Transaction
      const nowISO = new Date().toISOString();

      // Give Coin
      await update(ref(db, `students/${studentKey}`), {
        coins: currentCoins + 1,
      });

      // Log Transaction
      await set(coinLogRef, {
        lastCoinDate: nowISO,
        studentEmail: studentEmailTrimmed,
      });

      alert(`✅ Success! Sent 1 Coin to ${studentEmailTrimmed}.`);
      setRewardEmail("");
    } catch (error) {
      console.error("Reward Error:", error);
      alert(`Failed: ${error.message}`);
    } finally {
      setRewardLoading(false);
    }
  };

  const goToShopDetails = () => {
    if (myShop) {
      navigate("/shop-details", {
        state: {
          shop: myShop,
          studentData: {
            name: userData.name || userData.username,
            email: userData.email || "vendor@owner.com",
            isVendor: true,
            originalVendorData: userData.originalVendorData || userData,
          },
        },
      });
    }
  };

  if (!userData) return null;

  return (
    <div className="student-page">
      {!isVendor && <Navbar userData={userData} />}

      <div className="main-content">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="profile-header-section">
          <div className="profile-avatar-container">
            {userData.profileImage ? (
              <img
                src={userData.profileImage}
                alt="Profile"
                className="profile-avatar-img"
              />
            ) : (
              <div className="profile-avatar-img">
                {userData.name
                  ? userData.name[0].toUpperCase()
                  : userData.username
                  ? userData.username[0].toUpperCase()
                  : "U"}
              </div>
            )}
            <label htmlFor="avatar-upload" className="avatar-upload-btn">
              📷
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
            {userData.profileImage && (
              <button className="avatar-delete-btn" onClick={handleDeleteImage}>
                🗑️
              </button>
            )}
          </div>
          <h1 className="profile-name">{userData.name || userData.username}</h1>
          <span
            className={`profile-role-badge ${
              isVendor ? "role-vendor" : "role-student"
            }`}
          >
            {isVendor ? "Vendor Partner" : "Student"}
          </span>
        </div>

        <div className="profile-content-grid">
          <div className="left-card-section">
            {isVendor ? (
              <div className="profile-card-wrapper">
                <div className="profile-card-header">
                  <h3>🏪 My Shop</h3>
                  <button
                    className="edit-shop-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/edit-shop", {
                        state: {
                          vendorData: userData.originalVendorData || userData,
                        },
                      });
                    }}
                  >
                    ✏️ Edit
                  </button>
                </div>

                {myShop ? (
                  <div className="modern-shop-card" onClick={goToShopDetails}>
                    <div className="modern-shop-image-container">
                      <img
                        src={
                          myShop.shopImage ||
                          "https://via.placeholder.com/300x150"
                        }
                        alt="Shop"
                        className="card-main-image"
                      />
                      <span
                        className={`img-status-pill ${
                          myShop.status === "Closed" ? "closed" : "open"
                        }`}
                      >
                        {myShop.status === "Closed" ? "Closed" : "Open"}
                      </span>
                    </div>
                    <div className="modern-shop-info">
                      <h4>{myShop.shopName}</h4>
                      <div className="modern-shop-meta">
                        <span className="modern-badge">{myShop.category}</span>
                      </div>
                      <div className="modern-address">
                        <span>📍</span>
                        <span>{myShop.address || "Address not set"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      color: "#999",
                      marginTop: "20px",
                      textAlign: "center",
                    }}
                  >
                    <p>No shop registered yet.</p>
                    <button
                      className="btn-primary"
                      onClick={() =>
                        navigate("/vendor-dashboard", {
                          state: { vendorData: userData },
                        })
                      }
                      style={{ marginTop: "10px" }}
                    >
                      Register Shop Now
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="profile-card-wrapper coin-wallet-section">
                <h3>💰 My Wallet</h3>
                <div className="coin-display">
                  <span className="coin-count">{userData.coins || 0}</span>
                </div>
                <p>Coins Balance</p>
                <button
                  className="redeem-btn"
                  disabled={(userData.coins || 0) < 10}
                  onClick={handleRedeem}
                >
                  Redeem ₹10 Coupon
                </button>
              </div>
            )}
          </div>

          <div className="right-card-section">
            {isVendor ? (
              <div className="profile-card-wrapper reward-tool-card">
                <h3>🪙 Reward Customer</h3>
                <div className="coin-animation-container small-anim">
                  <div className="coin-3d">₹</div>
                </div>
                <p>Enter Student Email to send a loyalty coin.</p>
                <div className="reward-input-group">
                  <input
                    type="email"
                    placeholder="student@university.edu"
                    value={rewardEmail}
                    onChange={(e) => setRewardEmail(e.target.value)}
                    className="profile-input"
                  />
                  <button
                    className="small-btn btn-primary"
                    onClick={handleGiveCoin}
                    disabled={rewardLoading}
                  >
                    {rewardLoading ? "Verifying..." : "Send Coin"}
                  </button>
                </div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#64748b",
                    marginTop: "10px",
                    fontStyle: "italic",
                  }}
                >
                  *Student must have reviewed you this month.
                </p>
              </div>
            ) : (
              <div className="profile-card-wrapper coin-info-card">
                <div className="coin-animation-container">
                  <div className="coin-3d">₹</div>
                </div>
                <div className="coin-text">
                  <h3>How Coins Work</h3>
                  <p>
                    <strong>1. Visit Shops:</strong> Mention nearbyU.
                    <br />
                    <strong>2. Earn:</strong> Get 1 Coin per visit.
                    <br />
                    <strong>3. Redeem:</strong> 10 Coins = ₹10 Coupon!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
