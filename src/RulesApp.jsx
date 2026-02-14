const RulesApp = () => {
  return (
    <div className="rules-page">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark">
              <img src="/vv-logo.jpg" alt="Vedic Vivaha logo" />
            </div>
            <div>
              <p className="brand-name">Vedic Vivaha</p>
              <p className="brand-tag">Rules & Guidelines / Disclaimer</p>
            </div>
          </div>
          <nav className="nav-links">
            <a href="/">Home</a>
            <a href="/registration.html">Registration</a>
            <a href="/#contact">Contact</a>
          </nav>
        </div>
      </header>

      <section className="rules-hero">
        <div className="rules-hero-inner">
          <p className="eyebrow">Policy Page</p>
          <h1>Rules &amp; Guidelines / Disclaimer</h1>
          <p>
            This page defines the standards expected from all members and explains
            safety, verification, and legal responsibility while using Vedic Vivaha.
          </p>
          <p className="rules-updated">Last updated: February 13, 2026</p>
        </div>
      </section>

      <main className="rules-content">
        <section className="rules-section">
          <h2>1. About the Matrimony Company</h2>
          <p>
            Vedic Vivaha is a matrimony platform focused on the Brahmin community.
            Our mission is to provide an affordable, technology-forward, and value-based
            matchmaking service that supports families with dignity, transparency, and care.
          </p>
        </section>

        <section className="rules-section">
          <h2>2. User Eligibility &amp; Registration Rules</h2>
          <ul className="rules-list">
            <li>Users must be legally eligible for marriage under applicable law.</li>
            <li>Registration details must be truthful, current, and complete.</li>
            <li>Members are responsible for keeping login credentials confidential.</li>
            <li>Only one active profile per person is allowed unless approved by support.</li>
            <li>
              Any profile containing false identity, misleading details, or abusive content
              may be suspended or removed without prior notice.
            </li>
          </ul>
        </section>

        <section className="rules-section">
          <h2>3. Profile Verification &amp; Authenticity</h2>
          <ul className="rules-list">
            <li>Profiles are displayed based on user registration information only.</li>
            <li>
              The platform and management do not assume responsibility for the accuracy,
              completeness, or authenticity of profile information.
            </li>
            <li>
              Management will not be responsible for any type of loss, including personal,
              financial, legal, or other losses that may result from relying on profile
              information.
            </li>
            <li>No independent verification is performed by the platform.</li>
            <li>
              Users and their families should exercise their own judgment and perform
              independent verification before making decisions.
            </li>
          </ul>
        </section>

        <section className="rules-section">
          <h2>4. Code of Conduct for Members</h2>
          <ul className="rules-list">
            <li>Communicate respectfully and avoid harassment, insults, or pressure tactics.</li>
            <li>Respect cultural values, family boundaries, and consent at all times.</li>
            <li>No financial solicitation, investment requests, or borrowing/lending through the platform.</li>
            <li>No sharing of obscene, defamatory, discriminatory, or unlawful content.</li>
            <li>
              Use profile access only for genuine matrimonial purposes and not for unrelated networking.
            </li>
          </ul>
        </section>

        <section className="rules-section">
          <h2>5. Safety &amp; Privacy Guidelines</h2>
          <ul className="rules-list">
            <li>Use strong passwords and do not share OTPs or account credentials.</li>
            <li>Limit sharing of sensitive information until trust is established.</li>
            <li>Be cautious with rapid emotional pressure or urgent money-related requests.</li>
            <li>For first offline meetings, prefer public places and inform family members.</li>
            <li>Arrange transportation safely and avoid isolated locations for early interactions.</li>
          </ul>
        </section>

        <section className="rules-section rules-warning">
          <h2>6. Disclaimer</h2>
          <p>
            Vedic Vivaha provides a platform to connect members and families. We do not
            guarantee marriage outcomes, compatibility success, or continuous profile
            availability. Members must independently verify all profile information before
            any personal, legal, financial, or matrimonial commitment.
          </p>
        </section>

        <section className="rules-section">
          <h2>7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Vedic Vivaha and its team shall not be
            liable for direct or indirect loss, disputes, claims, fraud, misrepresentation,
            emotional distress, or damages arising from interactions between members, including
            online or offline meetings and decisions made based on profile information.
          </p>
        </section>

        <section className="rules-section">
          <h2>8. Contact / Reporting Misuse</h2>
          <p>
            If you notice suspicious behavior, fake profiles, abuse, or policy violations,
            report immediately with supporting details.
          </p>
          <ul className="rules-list">
            <li>Email: support@vedicvivaha.in</li>
            <li>Mobile: +91 90000 11223</li>
            <li>Office: +91 90000 22113</li>
          </ul>
          <p className="rules-note">
            We review reported issues promptly and may suspend or permanently block violating accounts.
          </p>
        </section>
      </main>

      <footer className="footer">
        <div>
          <h3>Vedic Vivaha</h3>
          <p>Guiding families with respect, authenticity, and sacred tradition.</p>
        </div>
        <div className="footer-links">
          <a href="/">Back to Home</a>
          <a href="/founder.html">About the Founder</a>
          <a href="/#contact">Contact</a>
        </div>
        <p className="footer-note">2026 © Vedic Vivaha. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RulesApp;
