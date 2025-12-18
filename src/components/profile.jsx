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

  // Accept 'studentData' (returned from VendorDetails) or 'userData' (from Login/Navbar)
  const initialUserData =
    location.state?.userData || location.state?.studentData;

  const [userData, setUserData] = useState(initialUserData);
  const [loading, setLoading] = useState(true);

  const [myShop, setMyShop] = useState(null);
  const [rewardEmail, setRewardEmail] = useState("");
  const [rewardLoading, setRewardLoading] = useState(false);

  const isVendor = !!userData?.storeName || userData?.isVendor === true;

  // Logic for Back Button
  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

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
          // Ensure walletBalance defaults to 0 if not present
          setUserData({
            ...val[key],
            key,
            walletBalance: val[key].walletBalance || 0,
          });
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

  // --- UPDATED: REDEEM LOGIC (Convert Coins to Wallet Money) ---
  const handleRedeem = async () => {
    if (userData.coins >= 10 && userData.key) {
      try {
        const newCoinBalance = userData.coins - 10;
        const newWalletBalance = (userData.walletBalance || 0) + 10;

        await update(ref(db, `students/${userData.key}`), {
          coins: newCoinBalance,
          walletBalance: newWalletBalance,
        });

        setUserData({
          ...userData,
          coins: newCoinBalance,
          walletBalance: newWalletBalance,
        });
        alert("🎉 ₹10 added to your Earned Money!");
      } catch (error) {
        console.error("Redemption error", error);
      }
    }
  };

  // --- NEW: WITHDRAW LOGIC ---
  const handleWithdraw = async () => {
    if ((userData.walletBalance || 0) > 0 && userData.key) {
      if (
        window.confirm(`Withdraw ₹${userData.walletBalance} to your account?`)
      ) {
        try {
          await update(ref(db, `students/${userData.key}`), {
            walletBalance: 0,
          });
          setUserData({ ...userData, walletBalance: 0 });
          alert("We have sent you the money!");
        } catch (error) {
          console.error("Withdrawal error", error);
        }
      }
    } else {
      alert("No earnings to withdraw yet.");
    }
  };

  const handleGiveCoin = async () => {
    if (!rewardEmail.trim()) return;
    setRewardLoading(true);
    try {
      const studentsRef = ref(db, "students");
      const q = query(
        studentsRef,
        orderByChild("email"),
        equalTo(rewardEmail.trim())
      );
      const snapshot = await get(q);
      if (snapshot.exists()) {
        const sData = snapshot.val();
        const sKey = Object.keys(sData)[0];
        const currentCoins = sData[sKey].coins || 0;

        await update(ref(db, `students/${sKey}`), { coins: currentCoins + 1 });

        alert(`Sent 1 Coin to ${rewardEmail}!`);
        setRewardEmail("");
      } else {
        alert("Student not found. Check the email ID.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to send coin.");
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
          from: "/profile",
        },
      });
    }
  };

  if (!userData) return null;

  return (
    <div className="student-page">
      {!isVendor && <Navbar userData={userData} />}

      <div className="main-content">
        <button className="back-btn" onClick={handleBack}>
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
            <label
              htmlFor="avatar-upload"
              className="avatar-upload-btn"
              title="Upload Photo"
            >
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
              <button
                className="avatar-delete-btn"
                onClick={handleDeleteImage}
                title="Remove Photo"
              >
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

                {/* 1. Redeem Button */}
                <button
                  className="redeem-btn"
                  disabled={(userData.coins || 0) < 10}
                  onClick={handleRedeem}
                  style={{ marginBottom: "20px" }}
                >
                  {(userData.coins || 0) >= 10
                    ? "Redeem ₹10"
                    : `Need ${10 - (userData.coins || 0)} more coins`}
                </button>

                {/* 2. NEW: Earned Money Section */}
                <div
                  className="earned-money-box"
                  style={{
                    background: "rgba(255, 255, 255, 0.5)",
                    padding: "15px",
                    borderRadius: "12px",
                    width: "100%",
                    border: "1px dashed #b45309",
                    marginTop: "10px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 5px 0",
                      fontSize: "0.9rem",
                      color: "#92400e",
                    }}
                  >
                    Earned Money
                  </h4>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "800",
                      color: "#15803d",
                      marginBottom: "10px",
                    }}
                  >
                    ₹{userData.walletBalance || 0}
                  </div>
                  <button
                    className="small-btn btn-primary"
                    style={{ background: "#15803d", border: "none" }}
                    onClick={handleWithdraw}
                    disabled={(userData.walletBalance || 0) <= 0}
                  >
                    Get earned money in Your account
                  </button>
                </div>
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
                    {rewardLoading ? "Sending..." : "Send Coin"}
                  </button>
                </div>
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
                    <strong>3. Redeem:</strong> 10 Coins = ₹10 Cash!
                    <br />
                    <strong>4. Withdraw:</strong> Transfer directly to your
                    account.
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
