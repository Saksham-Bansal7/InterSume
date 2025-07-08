import React from "react";
import { landingPageStyles } from "../assets/dummystyle";
import { LayoutTemplate, Menu, X } from "lucide-react";
import { useState } from "react";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  return (
    <div className={landingPageStyles.container}>
      <header className={landingPageStyles.header}>
        <div className={landingPageStyles.headerContainer}>
          <div className={landingPageStyles.logoContainer}>
            <div className={landingPageStyles.logoIcon}>
              <LayoutTemplate className={landingPageStyles.logoIconInner} />
            </div>
            <span className={landingPageStyles.logoText}>InterSume</span>
          </div>

          <button
            className={landingPageStyles.mobileMenuButton}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X size={24} className={landingPageStyles.mobileMenuIcon} />
            ) : (
              <Menu size={24} className={landingPageStyles.mobileMenuIcon} />
            )}
          </button>

          <div className="hidden md:flex items-center">
            {user ? (
              <ProfileInfoCard />
            ) : (
              <button
                className={landingPageStyles.desktopAuthButton}
                onClick={() => setOpenAuthModal(true)}
              >
                <div className={landingPageStyles.desktopAuthButtonOverlay}></div>
                <span className={landingPageStyles.desktopAuthButtonText}>Get started</span>
              </button>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className={landingPageStyles.mobileMenu}>
            <div className={landingPageStyles.mobileMenuContainer}>
                {user ? (
                  <div className={landingPageStyles.mobileProfileInfo}>
                    <div className={landingPageStyles.mobileUserWelcome}>
                        Welcome Back
                    </div>
                    <button className={landingPageStyles.mobileDashboardButton} onClick={() => {
                        navigate("/dashboard");
                        setMobileMenuOpen(false);
                    }}>
                      Dashboard
                    </button>
                  </div>
                ) : (
                  <button className={landingPageStyles.mobileAuthButton} onClick={() => {
                      setOpenAuthModal(true);
                      setMobileMenuOpen(false);
                  }}>
                    Get Started
                  </button>
                )}
            </div>
        </div>
        )}
      </header>
    </div>
  );
};

export default LandingPage;
