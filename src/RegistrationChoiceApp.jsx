const RegistrationChoiceApp = () => {
  return (
    <div className="registration-choice-page">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark">
              <img src="/vv-logo.jpg" alt="Vedic Vivaha logo" />
            </div>
            <div>
              <p className="brand-name">Vedic Vivaha</p>
              <p className="brand-tag">Choose your registration flow</p>
            </div>
          </div>
          <nav className="nav-links">
            <a href="/">Home</a>
            <a href="/rules.html">Rules & Disclaimer</a>
            <a href="/#contact">Contact</a>
          </nav>
        </div>
      </header>

      <section className="registration-choice-hero">
        <div className="registration-choice-hero-inner">
          <p className="eyebrow">Registration</p>
          <h1>Select Registration Type</h1>
          <p>Choose one option to continue with your profile setup or renewal process.</p>
        </div>
      </section>

      <main className="registration-choice-main">
        <div className="registration-choice-grid">
          <article className="choice-card choice-card-new">
            <div className="choice-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2>New Registration</h2>
            <p>Create a new profile and start your journey.</p>
            <a className="btn primary choice-btn" href="/register.html">
              Continue to New Registration
            </a>
          </article>

          <article className="choice-card choice-card-renew">
            <div className="choice-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 5V10H15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 19V14H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.8 9.2C7.5 7.4 9.2 6 11.3 5.6C13.4 5.2 15.5 5.8 17 7.1L20 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.2 14.8C16.5 16.6 14.8 18 12.7 18.4C10.6 18.8 8.5 18.2 7 16.9L4 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2>Renew Registration</h2>
            <p>Renew your existing profile instantly.</p>
            <a className="btn ghost choice-btn" href="/renew.html">
              Continue to Renewal
            </a>
          </article>
        </div>
      </main>
    </div>
  );
};

export default RegistrationChoiceApp;
