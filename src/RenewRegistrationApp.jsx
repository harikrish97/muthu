import { useState } from "react";

const VALID_RENEW_COUPONS = new Set(["RENEW100", "VVRENEW", "LOYAL50"]);
const RENEWAL_AMOUNT = "INR 999";

const RenewRegistrationApp = () => {
  const [verified, setVerified] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationError, setVerificationError] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState({ status: "idle", message: "" });
  const [paymentMessage, setPaymentMessage] = useState("");

  const handleVerify = (event) => {
    event.preventDefault();
    setPaymentMessage("");

    const form = event.currentTarget;
    if (!form.reportValidity()) {
      return;
    }

    setVerified(true);
    setVerificationError(false);
    setVerificationMessage("Verification details captured. You can continue to payment.");
  };

  const handleApplyCoupon = (event) => {
    const form = event.currentTarget.form;
    const code = String(form?.couponCode?.value || "").trim().toUpperCase();

    if (!code) {
      setCouponFeedback({
        status: "error",
        message: "Enter a coupon/referral code to apply."
      });
      return;
    }

    if (VALID_RENEW_COUPONS.has(code)) {
      form.couponCode.value = code;
      setCouponFeedback({
        status: "success",
        message: "Coupon applied. Final discount will be shown at checkout."
      });
      return;
    }

    setCouponFeedback({
      status: "error",
      message: "Code not recognized. Please check and try again."
    });
  };

  const handlePayNow = () => {
    if (!verified) {
      setVerificationError(true);
      setVerificationMessage("Please complete renewal verification before payment.");
      return;
    }

    setVerificationError(false);
    setPaymentMessage("Proceeding to secure payment...");
  };

  return (
    <div className="renew-page">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark">
              <img src="/vv-logo.jpg" alt="Vedic Vivaha logo" />
            </div>
            <div>
              <p className="brand-name">Vedic Vivaha</p>
              <p className="brand-tag">Renew your existing membership</p>
            </div>
          </div>
          <nav className="nav-links">
            <a href="/">Home</a>
            <a href="/registration.html">Registration</a>
            <a href="/rules.html">Rules & Disclaimer</a>
            <a href="/#contact">Contact</a>
          </nav>
          <a className="btn ghost" href="/register.html">
            New Registration
          </a>
        </div>
      </header>

      <section className="renew-hero">
        <div className="renew-hero-inner">
          <p className="eyebrow">Renew Registration</p>
          <h1>Renew Your Existing Profile</h1>
          <p>Verify your account details and complete renewal payment.</p>
        </div>
      </section>

      <main className="renew-main">
        <form className="renew-form" onSubmit={handleVerify} noValidate>
          <section className="registration-group">
            <h2>A. Renewal Verification</h2>
            <div className="registration-grid">
              <label>
                <span>Existing Registration ID <span className="required-star">*</span></span>
                <input type="text" name="registrationId" placeholder="e.g. VV-123456" required />
              </label>
              <label>
                <span>Registered Email or Phone Number <span className="required-star">*</span></span>
                <input
                  type="text"
                  name="registeredContact"
                  placeholder="Enter registered email or phone"
                  required
                />
              </label>
            </div>
            <button className="btn ghost" type="submit">
              Verify Renewal Details
            </button>
            {verificationMessage && (
              <p className={`form-message ${verificationError ? "error" : "success"}`}>
                {verificationMessage}
              </p>
            )}
          </section>

          <section className="registration-group">
            <h2>B. Renewal Payment</h2>
            <div className="renew-amount-card">
              <p>Renewal Amount</p>
              <h3>{RENEWAL_AMOUNT}</h3>
              <span>Membership renewal for one period</span>
            </div>
            <label className="registration-full">
              <span>Coupon / Referral Code (optional)</span>
              <div className="renew-coupon-row">
                <input type="text" name="couponCode" placeholder="Enter coupon or referral code" />
                <button className="referral-apply-btn" type="button" onClick={handleApplyCoupon}>
                  Apply
                </button>
              </div>
            </label>
            {couponFeedback.message && (
              <p className={`referral-status ${couponFeedback.status}`}>{couponFeedback.message}</p>
            )}
            <p className="renew-helper">
              Click Pay Now to renew your profile for another membership period.
            </p>
            <button className="btn primary renew-pay-btn" type="button" onClick={handlePayNow}>
              <span className="renew-pay-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
              Pay Now
            </button>
            <div className="secure-badge">
              <span className="secure-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 11V8C7 5.2 9.2 3 12 3C14.8 3 17 5.2 17 8V11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
              <span>Secure payment protected with encrypted checkout.</span>
            </div>
            {paymentMessage && <p className="form-message success">{paymentMessage}</p>}
          </section>
        </form>
      </main>
    </div>
  );
};

export default RenewRegistrationApp;
