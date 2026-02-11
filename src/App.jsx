import { useState } from "react";

const App = () => {
  const [registerMessage, setRegisterMessage] = useState("");
  const [registerError, setRegisterError] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setRegisterMessage("");
    setRegisterError(false);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to submit registration");
      }
      setRegisterMessage(`Registration saved. Your ID is ${data.id}.`);
      form.reset();
    } catch (err) {
      setRegisterError(true);
      setRegisterMessage(err.message);
    }
  };

  return (
    <div className="page">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark">VV</div>
            <div>
              <p className="brand-name">Vedic Vivaha</p>
              <p className="brand-tag">Sacred matchmaking, guided by tradition.</p>
            </div>
          </div>
          <nav className="nav-links">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#features">Features</a>
            <a href="#tariff">Tariff</a>
            <a href="#register">Registration</a>
            <a href="#profiles">Profiles</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="btn primary" href="#register">Register Now</a>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-inner">
          <div className="hero-content">
            <p className="eyebrow reveal">Trusted Vedic matrimony since 1999</p>
            <h1 className="reveal delay-1">
              Vedic Vivaha connects families with authenticity and care.
            </h1>
            <p className="subtext reveal delay-2">
              Verified profiles, Vedic compatibility guidance, and a personal advisor who
              understands your values. We help you find the right alliance with dignity and
              discretion.
            </p>
            <div className="hero-actions reveal delay-3">
              <a className="btn primary" href="#register">Create Profile</a>
              <a className="btn ghost" href="#contact">Speak to an Advisor</a>
            </div>
            <div className="hero-stats reveal delay-4">
              <div>
                <h3>25+ yrs</h3>
                <p>Trusted service</p>
              </div>
              <div>
                <h3>18k+</h3>
                <p>Verified profiles</p>
              </div>
              <div>
                <h3>92%</h3>
                <p>Match satisfaction</p>
              </div>
            </div>
          </div>
          <div className="hero-panel">
            <div className="login-card reveal">
              <div className="login-head">
                <h3>Member Login</h3>
                <p>Enter only the profile number, without year or prefix.</p>
              </div>
              <form className="login-form" onSubmit={handleSubmit}>
                <label>
                  <span>Member ID</span>
                  <input type="text" placeholder="e.g. 181412" required />
                </label>
                <label>
                  <span>Password</span>
                  <input type="password" placeholder="••••••••" required />
                </label>
                <button className="btn primary" type="submit">Login</button>
              </form>
              <div className="login-links">
                <a href="#register">New Registration</a>
                <a href="#contact">Login Procedure</a>
              </div>
            </div>
            <div className="notice-card reveal delay-1">
              <h4>Important Notice</h4>
              <p>
                Protect your information. Vedic Vivaha never asks for OTP or payment details
                over phone or email.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="info-strip">
        <div className="strip-item">
          <h3>Personal Advisors</h3>
          <p>Dedicated guidance from registration to match finalization.</p>
        </div>
        <div className="strip-item">
          <h3>Horoscope Support</h3>
          <p>Vedic compatibility and star alignment consultations.</p>
        </div>
        <div className="strip-item">
          <h3>Verified Profiles</h3>
          <p>Every profile is screened for authenticity and intent.</p>
        </div>
      </section>

      <section className="section" id="about">
        <div className="section-head">
          <div>
            <p className="eyebrow">About Vedic Vivaha</p>
            <h2>We blend tradition with thoughtful, modern service.</h2>
          </div>
        </div>
        <div className="about-grid">
          <article className="card">
            <h3>Our Vision</h3>
            <p>
              To build lasting alliances rooted in values, compatibility, and mutual respect.
              Every match is handled with confidentiality and care.
            </p>
            <ul className="list">
              <li>Respect for family traditions</li>
              <li>Trusted guidance by experienced staff</li>
              <li>Discreet, secure information handling</li>
            </ul>
          </article>
          <article className="card">
            <h3>Founder Message</h3>
            <p>
              "We believe matchmaking is sacred. Our team ensures every family feels heard,
              supported, and informed throughout the journey."
            </p>
            <div className="signature">
              <div className="signature-line"></div>
              <div>
                <p className="signature-name">Dr. S. Narayanan</p>
                <span>Founder & Director</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section tint" id="features">
        <div className="section-head">
          <div>
            <p className="eyebrow">Features</p>
            <h2>Everything you need for a confident, respectful search.</h2>
          </div>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Smart Match Filters</h3>
            <p>Shortlist profiles using age, education, location, and tradition preferences.</p>
          </article>
          <article className="feature-card">
            <h3>Assisted Calls</h3>
            <p>We schedule introductions with family consent and privacy.</p>
          </article>
          <article className="feature-card">
            <h3>Secure Document Vault</h3>
            <p>Share horoscopes, biodata, and photos with controlled access.</p>
          </article>
          <article className="feature-card">
            <h3>Verified Photos</h3>
            <p>Every photo is verified by our team to maintain authenticity.</p>
          </article>
        </div>
      </section>

      <section className="section" id="tariff">
        <div className="section-head">
          <div>
            <p className="eyebrow">Tariff & Schemes</p>
            <h2>Choose a plan that suits your family.</h2>
          </div>
        </div>
        <div className="plan-grid">
          <article className="plan-card">
            <h3>Classic</h3>
            <p className="plan-price">Rs 3,500</p>
            <ul className="list">
              <li>Profile listing for 6 months</li>
              <li>Up to 10 verified contacts</li>
              <li>Email and phone support</li>
            </ul>
            <button className="btn ghost" type="button">Select Classic</button>
          </article>
          <article className="plan-card highlight">
            <div className="plan-tag">Most Chosen</div>
            <h3>Premium</h3>
            <p className="plan-price">Rs 7,500</p>
            <ul className="list">
              <li>Priority advisor support</li>
              <li>Unlimited verified contacts</li>
              <li>Horoscope compatibility report</li>
            </ul>
            <button className="btn primary" type="button">Select Premium</button>
          </article>
          <article className="plan-card">
            <h3>Elite</h3>
            <p className="plan-price">Rs 12,000</p>
            <ul className="list">
              <li>Dedicated senior advisor</li>
              <li>Family introductions arranged</li>
              <li>Personalized match tracking</li>
            </ul>
            <button className="btn ghost" type="button">Select Elite</button>
          </article>
        </div>
      </section>

      <section className="section tint" id="register">
        <div className="section-head">
          <div>
            <p className="eyebrow">Registration</p>
            <h2>Register in four simple steps.</h2>
          </div>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <span className="step-count">01</span>
            <h3>Submit basic details</h3>
            <p>Share family background, education, and contact preferences.</p>
          </div>
          <div className="step-card">
            <span className="step-count">02</span>
            <h3>Upload horoscope</h3>
            <p>Provide Rasi and Navamsa charts for compatibility.</p>
          </div>
          <div className="step-card">
            <span className="step-count">03</span>
            <h3>Profile verification</h3>
            <p>Our team verifies documents and photos within 48 hours.</p>
          </div>
          <div className="step-card">
            <span className="step-count">04</span>
            <h3>Start matching</h3>
            <p>Receive curated profiles and schedule introductions.</p>
          </div>
        </div>
        <div className="register-panel">
          <div>
            <h3>Ready to begin?</h3>
            <p>Register online or visit our Chennai office for a guided signup.</p>
          </div>
          <button className="btn primary" type="button">Start Registration</button>
        </div>
        <div className="register-grid">
          <form className="register-form" onSubmit={handleRegister}>
            <h3>Quick Registration</h3>
            <p className="form-note">Submit your details and our advisor will call you within 24 hours.</p>
            <div className="form-grid">
              <label>
                <span>Full Name</span>
                <input type="text" name="name" placeholder="Full name" required />
              </label>
              <label>
                <span>Email Address</span>
                <input type="email" name="email" placeholder="you@example.com" required />
              </label>
              <label>
                <span>Phone Number</span>
                <input type="tel" name="phone" placeholder="+91" required />
              </label>
              <label>
                <span>Gender</span>
                <select name="gender">
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>
                <span>Date of Birth</span>
                <input type="date" name="dob" />
              </label>
              <label>
                <span>City</span>
                <input type="text" name="city" placeholder="City" />
              </label>
              <label>
                <span>Education</span>
                <input type="text" name="education" placeholder="Highest qualification" />
              </label>
              <label>
                <span>Occupation</span>
                <input type="text" name="occupation" placeholder="Profession" />
              </label>
              <label>
                <span>Gothram</span>
                <input type="text" name="gothram" placeholder="Gothram" />
              </label>
            </div>
            <label>
              <span>Message</span>
              <textarea name="message" rows="4" placeholder="Tell us about your preferences"></textarea>
            </label>
            {registerMessage && (
              <p className={`form-message ${registerError ? "error" : "success"}`}>
                {registerMessage}
              </p>
            )}
            <button className="btn primary" type="submit">Submit Registration</button>
          </form>
          <div className="card register-info">
            <h3>What happens next?</h3>
            <ul className="list">
              <li>Profile verification within 48 hours</li>
              <li>Advisor calls to understand family preferences</li>
              <li>Curated shortlist shared for review</li>
            </ul>
            <p className="form-note">
              We never share your details without family consent.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="payment">
        <div className="section-head">
          <div>
            <p className="eyebrow">Payment Options</p>
            <h2>Flexible, secure ways to pay.</h2>
          </div>
        </div>
        <div className="payment-grid">
          <div className="payment-card">UPI / QR</div>
          <div className="payment-card">Debit & Credit Cards</div>
          <div className="payment-card">Net Banking</div>
          <div className="payment-card">Cash at Office</div>
        </div>
      </section>

      <section className="section tint" id="chart">
        <div className="section-head">
          <div>
            <p className="eyebrow">Chart - Basic Details</p>
            <h2>Essential information we collect.</h2>
          </div>
        </div>
        <div className="chart-grid">
          <div className="chart-card">
            <h3>Personal</h3>
            <ul className="list">
              <li>Name and date of birth</li>
              <li>Time and place of birth</li>
              <li>Height, complexion, and hobbies</li>
            </ul>
          </div>
          <div className="chart-card">
            <h3>Education & Career</h3>
            <ul className="list">
              <li>Highest qualification</li>
              <li>Occupation and employer</li>
              <li>Annual income range</li>
            </ul>
          </div>
          <div className="chart-card">
            <h3>Family</h3>
            <ul className="list">
              <li>Parents and siblings details</li>
              <li>Traditional preferences</li>
              <li>Residence and native</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section" id="profiles">
        <div className="section-head">
          <div>
            <p className="eyebrow">Profiles & Photos</p>
            <h2>Recently added verified profiles.</h2>
          </div>
          <a className="btn ghost" href="#register">View all profiles</a>
        </div>
        <div className="profile-grid">
          <article className="profile-card">
            <div className="profile-avatar">A</div>
            <h3>Profile VV-2401</h3>
            <p>Software Engineer, Chennai</p>
            <span>26 yrs · Bharadwaj Gothram</span>
          </article>
          <article className="profile-card">
            <div className="profile-avatar">S</div>
            <h3>Profile VV-3176</h3>
            <p>Chartered Accountant, Bengaluru</p>
            <span>28 yrs · Vatsya Gothram</span>
          </article>
          <article className="profile-card">
            <div className="profile-avatar">M</div>
            <h3>Profile VV-2894</h3>
            <p>Doctor, Coimbatore</p>
            <span>27 yrs · Kaundinya Gothram</span>
          </article>
        </div>
      </section>

      <section className="section tint">
        <div className="section-head">
          <div>
            <p className="eyebrow">Client Feedback</p>
            <h2>Families who found their match with us.</h2>
          </div>
        </div>
        <div className="review-grid">
          <article className="review-card">
            <p>
              "The advisor guided us with patience. We felt respected at every step and found a
              wonderful match for our daughter."
            </p>
            <h4>Meera & Suresh</h4>
            <span>Madurai</span>
          </article>
          <article className="review-card">
            <p>
              "Their verification process gave us confidence. We appreciated the detailed
              horoscope support and family introductions."
            </p>
            <h4>Rajesh</h4>
            <span>Hyderabad</span>
          </article>
          <article className="review-card">
            <p>
              "Professional, transparent, and genuinely caring. Vedic Vivaha respected our
              tradition and values."
            </p>
            <h4>Bhavna</h4>
            <span>Chennai</span>
          </article>
        </div>
      </section>

      <section className="section contact" id="contact">
        <div className="contact-grid">
          <div>
            <p className="eyebrow">Contact Us</p>
            <h2>Visit or speak with our advisors.</h2>
            <p className="subtext">
              Chennai Office: 18, Temple Road, Mylapore, Chennai 600 004. Open 10:00 AM to
              6:30 PM, Monday to Saturday.
            </p>
            <div className="contact-details">
              <p>Mobile: +91 90000 11223</p>
              <p>Office: +91 90000 22113</p>
              <p>Email: support@vedicvivaha.in</p>
            </div>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <label>
              <span>Your Name</span>
              <input type="text" placeholder="Full name" required />
            </label>
            <label>
              <span>Phone Number</span>
              <input type="tel" placeholder="+91" required />
            </label>
            <label>
              <span>Message</span>
              <textarea rows="4" placeholder="Tell us about your requirements"></textarea>
            </label>
            <button className="btn primary" type="submit">Request a Call Back</button>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div>
          <h3>Vedic Vivaha</h3>
          <p>Guiding families with respect, authenticity, and sacred tradition.</p>
        </div>
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#tariff">Tariff</a>
          <a href="#contact">Contact</a>
        </div>
        <p className="footer-note">2026 © Vedic Vivaha. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
