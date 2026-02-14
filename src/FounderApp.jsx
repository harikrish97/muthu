const FounderApp = () => {
  return (
    <div className="founder-page">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark">
              <img src="/vv-logo.jpg" alt="Vedic Vivaha logo" />
            </div>
            <div>
              <p className="brand-name">Vedic Vivaha</p>
              <p className="brand-tag">About the Founder</p>
            </div>
          </div>
          <nav className="nav-links">
            <a href="/">Home</a>
            <a href="/registration.html">Registration</a>
            <a href="/rules.html">Rules & Disclaimer</a>
            <a href="/#contact">Contact</a>
          </nav>
        </div>
      </header>

      <section className="founder-hero">
        <div className="founder-hero-inner">
          <p className="eyebrow">About the Founder</p>
          <h1>A Technology-Led Matrimony Vision Rooted in Values</h1>
          <p>
            This page shares the Founder&apos;s background, purpose, and the principles guiding
            Vedic Vivaha.
          </p>
        </div>
      </section>

      <main className="founder-main">
        <section className="founder-section">
          <h2>Founder&apos;s Message</h2>
          <div className="founder-message-layout">
            <div className="founder-photo-placeholder" aria-label="Founder photo placeholder">
              Photo Space
            </div>
            <div className="founder-message-copy">
              <p className="founder-name">Shri.C.R Rajagopal</p>
              <p>
                Shri.C.R Rajagopal is the Founder of this matrimony platform and a retired
                Sub-Divisional Engineer from BSNL, Coimbatore. During his professional career, he
                served in multiple technical and administrative capacities with a disciplined,
                process-driven approach.
              </p>
              <p>
                He has a strong background in Mathematics, is a skilled programmer, and is also a
                passionate chess player. As part of his social service efforts, he has conducted
                free mathematics tuition for several underprivileged students.
              </p>
              <p>
                He also developed a unique calendar formula that helps determine the day of the
                week for any date from 1 AD to dates millions of years into the future through a
                mathematical method.
              </p>
              <p>
                He established this matrimony platform as a goodwill initiative for the community,
                with the objective of enabling quicker matrimonial settlements at an affordable
                cost through smart, technology-driven features.
              </p>
              <p>
                The platform is built on transparency, privacy, integrity, and community values,
                with a steady commitment to trust and responsible service.
              </p>
            </div>
          </div>
        </section>

        <section className="founder-section founder-disclaimer-box">
          <h2>Important Disclaimer</h2>
          <ul className="rules-list">
            <li>Profiles are displayed based on information submitted by users.</li>
            <li>The management does not independently verify all profile details.</li>
            <li>
              The platform does not assume responsibility for the accuracy, authenticity, or
              completeness of profile information.
            </li>
            <li>
              The management will not be responsible for any personal, financial, legal, or
              matrimonial loss arising from reliance on profile information.
            </li>
            <li>
              Users are strongly encouraged to independently verify all details before making any
              decisions.
            </li>
          </ul>
        </section>

        <div className="founder-actions">
          <a className="btn ghost" href="/">
            Back to Home
          </a>
          <a className="btn primary" href="/rules.html">
            Rules &amp; Disclaimer
          </a>
        </div>
      </main>
    </div>
  );
};

export default FounderApp;
