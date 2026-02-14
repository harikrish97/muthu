import { useRef, useState } from "react";
import { apiFetch } from "./lib/api";

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HEIGHT_OPTIONS = Array.from({ length: 31 }, (_, index) => `${140 + index * 2} cm`);

const RASI_OPTIONS = [
  "Mesham",
  "Rishabam",
  "Mithunam",
  "Kadagam",
  "Simmam",
  "Kanni",
  "Thulam",
  "Viruchigam",
  "Dhanusu",
  "Magaram",
  "Kumbam",
  "Meenam"
];

const NAKSHATRA_OPTIONS = [
  "Ashwini",
  "Bharani",
  "Karthigai",
  "Rohini",
  "Mrigashirsha",
  "Thiruvathirai",
  "Punarpoosam",
  "Poosam",
  "Ayilyam",
  "Magam",
  "Pooram",
  "Uthiram",
  "Hastham",
  "Chithirai",
  "Swathi",
  "Visakam",
  "Anusham",
  "Kettai",
  "Moolam",
  "Pooradam",
  "Uthiradam",
  "Thiruvonam",
  "Avittam",
  "Sathayam",
  "Poorattadhi",
  "Uthirattadhi",
  "Revathi"
];

const MOTHER_TONGUE_OPTIONS = [
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Hindi",
  "Sanskrit",
  "Other"
];

const SECT_OPTIONS = ["Iyer", "Iyengar"];

const CONTACT_RELATION_OPTIONS = ["Father", "Mother", "Brother", "Sister", "Spouse", "Friend", "Other"];

const SUBSECT_OPTIONS_BY_SECT = {
  Iyer: ["Vadama", "Brahacharnam", "Vahima", "Sholiyar", "Ashtasahasram", "Gurukkal"],
  Iyengar: ["Thenkalai", "Vadakalai"]
};

const DISABILITY_TYPE_OPTIONS = [
  "Visual Impairment",
  "Hearing Impairment",
  "Locomotor Disability",
  "Intellectual Disability",
  "Speech & Language Disability",
  "Multiple Disabilities",
  "Other"
];

const CURRENCY_OPTIONS = [
  "USD - US Dollar",
  "INR - Indian Rupee",
  "EUR - Euro",
  "GBP - British Pound",
  "AUD - Australian Dollar",
  "CAD - Canadian Dollar",
  "SGD - Singapore Dollar",
  "AED - UAE Dirham",
  "SAR - Saudi Riyal",
  "QAR - Qatari Riyal",
  "KWD - Kuwaiti Dinar",
  "BHD - Bahraini Dinar",
  "OMR - Omani Rial",
  "JPY - Japanese Yen",
  "CNY - Chinese Yuan",
  "HKD - Hong Kong Dollar",
  "NZD - New Zealand Dollar",
  "CHF - Swiss Franc",
  "NOK - Norwegian Krone",
  "SEK - Swedish Krona",
  "DKK - Danish Krone",
  "ZAR - South African Rand",
  "MYR - Malaysian Ringgit",
  "THB - Thai Baht",
  "IDR - Indonesian Rupiah",
  "PHP - Philippine Peso",
  "KRW - South Korean Won",
  "TRY - Turkish Lira",
  "RUB - Russian Ruble",
  "MXN - Mexican Peso",
  "BRL - Brazilian Real"
];

// Replace these with backend-validated referral codes when API support is added.
const VALID_REFERRAL_CODES = new Set([
  "VVFRIEND",
  "VEDIC2026",
  "FAMILYLINK",
  "BRAHMAMATCH"
]);

const validateUpload = (file, fieldName) => {
  if (!(file instanceof File) || file.size === 0) {
    if (fieldName === "profilePhoto") {
      return "Profile photo is required.";
    }
    if (fieldName === "governmentProofFile") {
      return "Government proof document is required.";
    }
    if (fieldName === "doctorCertificateFile") {
      return "Doctor certificate is required.";
    }
    return "";
  }

  const allowedTypes =
    fieldName === "profilePhoto"
      ? ["image/jpeg", "image/png"]
      : ["image/jpeg", "image/png", "application/pdf"];

  if (!allowedTypes.includes(file.type)) {
    return fieldName === "profilePhoto"
      ? "Profile photo must be JPG or PNG."
      : fieldName === "governmentProofFile"
        ? "Government proof must be PDF, JPG, or PNG."
        : fieldName === "doctorCertificateFile"
          ? "Doctor certificate must be PDF, JPG, or PNG."
        : "Horoscope file must be PDF, JPG, or PNG.";
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return "File must be 5MB or smaller.";
  }

  return "";
};

const RegisterApp = () => {
  const [disability, setDisability] = useState("");
  const [sect, setSect] = useState("");
  const [subsect, setSubsect] = useState("");
  const [partnerSectPreference, setPartnerSectPreference] = useState("");
  const [partnerSubsectPreference, setPartnerSubsectPreference] = useState("");
  const [referralFeedback, setReferralFeedback] = useState({ status: "idle", message: "" });
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileFileName, setProfileFileName] = useState("");
  const [horoscopeFileName, setHoroscopeFileName] = useState("");
  const [governmentProofFileName, setGovernmentProofFileName] = useState("");
  const [doctorCertificateFileName, setDoctorCertificateFileName] = useState("");
  const referralInputRef = useRef(null);

  const clearFieldError = (fieldName) => {
    setFieldErrors((current) => {
      if (!current[fieldName]) return current;
      const next = { ...current };
      delete next[fieldName];
      return next;
    });
  };

  const evaluateReferralCode = (rawCode) => {
    const normalizedCode = String(rawCode || "").trim().toUpperCase();
    if (!normalizedCode) {
      return { valid: true, normalizedCode: "", message: "", status: "idle" };
    }

    if (VALID_REFERRAL_CODES.has(normalizedCode)) {
      return {
        valid: true,
        normalizedCode,
        message: "Referral code applied!",
        status: "success"
      };
    }

    return {
      valid: false,
      normalizedCode,
      message: "Referral code not recognized — please check and try again.",
      status: "error"
    };
  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    clearFieldError(name);
    if (name === "password" || name === "confirmPassword") {
      clearFieldError("password");
      clearFieldError("confirmPassword");
    }
    if (name === "referralCode") {
      if (!String(value || "").trim()) {
        setReferralFeedback({ status: "idle", message: "" });
      } else {
        setReferralFeedback({ status: "idle", message: "" });
      }
      return;
    }
    if (name === "sect") {
      setSect(value);
      setSubsect("");
      clearFieldError("subsect");
      return;
    }
    if (name === "subsect") {
      setSubsect(value);
      return;
    }
    if (name === "partnerSectPreference") {
      setPartnerSectPreference(value);
      setPartnerSubsectPreference("");
      return;
    }
    if (name === "partnerSubsectPreference") {
      setPartnerSubsectPreference(value);
      return;
    }
    if (name === "disability") {
      setDisability(value);
      clearFieldError("disabilityType");
      clearFieldError("disabilityPercentage");
      clearFieldError("doctorCertificateFile");
      if (value !== "Yes") {
        setDoctorCertificateFileName("");
      }
    }
  };

  const applyReferralCode = (inputElement) => {
    if (!inputElement) {
      return;
    }

    const result = evaluateReferralCode(inputElement.value);
    if (result.normalizedCode) {
      inputElement.value = result.normalizedCode;
    }

    setReferralFeedback({ status: result.status, message: result.message });
    setFieldErrors((current) => {
      const next = { ...current };
      if (result.valid) {
        delete next.referralCode;
      } else {
        next.referralCode = result.message;
      }
      return next;
    });
  };

  const handleReferralBlur = (event) => {
    applyReferralCode(event.target);
  };

  const handleApplyReferral = () => {
    applyReferralCode(referralInputRef.current);
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    const file = files?.[0];
    const errorMessage = validateUpload(file, name);

    if (name === "profilePhoto") {
      setProfileFileName(file?.name || "");
    } else if (name === "horoscopeFile") {
      setHoroscopeFileName(file?.name || "");
    } else if (name === "governmentProofFile") {
      setGovernmentProofFileName(file?.name || "");
    } else if (name === "doctorCertificateFile") {
      setDoctorCertificateFileName(file?.name || "");
    }

    setFieldErrors((current) => {
      const next = { ...current };
      if (errorMessage) {
        next[name] = errorMessage;
      } else {
        delete next[name];
      }
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormMessage("");
    setFormError(false);

    const form = event.currentTarget;
    if (!form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    const nextErrors = {};

    const password = String(formData.get("password") || "").trim();
    const confirmPassword = String(formData.get("confirmPassword") || "").trim();
    if (password.length < 4) {
      nextErrors.password = "Password must be at least 4 characters.";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please re-enter your password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    const email = String(formData.get("email") || "").trim();
    if (!EMAIL_REGEX.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    const phoneDigits = String(formData.get("phone") || "").replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      nextErrors.phone = "Please enter a valid phone number.";
    }

    const whatsappDigits = String(formData.get("whatsappNumber") || "").replace(/\D/g, "");
    if (whatsappDigits.length < 10 || whatsappDigits.length > 13) {
      nextErrors.whatsappNumber = "Please enter a valid WhatsApp number.";
    }

    const alternateDigits = String(formData.get("alternateContactNumber") || "").replace(/\D/g, "");
    if (alternateDigits && (alternateDigits.length < 10 || alternateDigits.length > 13)) {
      nextErrors.alternateContactNumber = "Please enter a valid alternate contact number.";
    }

    const profilePhotoError = validateUpload(formData.get("profilePhoto"), "profilePhoto");
    if (profilePhotoError) {
      nextErrors.profilePhoto = profilePhotoError;
    }

    const horoscopeError = validateUpload(formData.get("horoscopeFile"), "horoscopeFile");
    if (horoscopeError) {
      nextErrors.horoscopeFile = horoscopeError;
    }

    const governmentProofError = validateUpload(
      formData.get("governmentProofFile"),
      "governmentProofFile"
    );
    if (governmentProofError) {
      nextErrors.governmentProofFile = governmentProofError;
    }

    const disabilityValue = String(formData.get("disability") || "").trim();
    if (!disabilityValue) {
      nextErrors.disability = "Please select disability status.";
    }
    if (disabilityValue === "Yes") {
      const disabilityType = String(formData.get("disabilityType") || "").trim();
      if (!disabilityType) {
        nextErrors.disabilityType = "Please select disability type.";
      }

      const disabilityPercentageRaw = String(formData.get("disabilityPercentage") || "").trim();
      const disabilityPercentage = Number(disabilityPercentageRaw);
      if (!disabilityPercentageRaw || Number.isNaN(disabilityPercentage)) {
        nextErrors.disabilityPercentage = "Please enter disability percentage.";
      } else if (disabilityPercentage < 0 || disabilityPercentage > 100) {
        nextErrors.disabilityPercentage = "Disability percentage must be between 0 and 100.";
      }

      const doctorCertificateError = validateUpload(
        formData.get("doctorCertificateFile"),
        "doctorCertificateFile"
      );
      if (doctorCertificateError) {
        nextErrors.doctorCertificateFile = doctorCertificateError;
      }
      formData.set("free_registration", "true");
    } else {
      formData.delete("free_registration");
    }

    const sectValue = String(formData.get("sect") || "").trim();
    const subsectValue = String(formData.get("subsect") || "").trim();
    if (sectValue && !subsectValue) {
      nextErrors.subsect = "Please select a subsect.";
    }

    const referralCheck = evaluateReferralCode(formData.get("referralCode"));
    if (!referralCheck.valid) {
      nextErrors.referralCode = referralCheck.message;
      setReferralFeedback({ status: "error", message: referralCheck.message });
    } else if (referralCheck.normalizedCode) {
      setReferralFeedback({ status: "success", message: referralCheck.message });
      formData.set("referralCode", referralCheck.normalizedCode);
    } else {
      setReferralFeedback({ status: "idle", message: "" });
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setFormError(true);
      setFormMessage("Please correct the highlighted fields and submit again.");
      return;
    }

    formData.delete("confirmPassword");

    const payload = {};
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (value.size === 0) continue;
        payload[key] = {
          fileName: value.name,
          fileType: value.type,
          fileSize: value.size
        };
      } else {
        payload[key] = String(value).trim();
      }
    }

    payload.city = payload.currentLocation || "";
    payload.education = payload.highestQualification || "";
    payload.address = payload.nativePlace || "";
    payload.message = payload.aboutMe || "";

    setIsSubmitting(true);
    try {
      const data = await apiFetch("/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      setFormError(false);
      setFormMessage(
        `Registration submitted successfully. Your Member ID is ${data.id}.`
      );
      setFieldErrors({});
      setProfileFileName("");
      setHoroscopeFileName("");
      setGovernmentProofFileName("");
      setDoctorCertificateFileName("");
      setDisability("");
      setSect("");
      setSubsect("");
      setPartnerSectPreference("");
      setPartnerSubsectPreference("");
      setReferralFeedback({ status: "idle", message: "" });
      form.reset();
    } catch (err) {
      setFormError(true);
      setFormMessage(err.message || "Unable to submit registration right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark">
              <img src="/vv-logo.jpg" alt="Vedic Vivaha logo" />
            </div>
            <div>
              <p className="brand-name">Vedic Vivaha</p>
              <p className="brand-tag">Traditional values with modern matchmaking support.</p>
            </div>
          </div>
          <nav className="nav-links">
            <a href="/">Home</a>
            <a href="/founder.html">Founder</a>
            <a href="/rules.html">Rules & Disclaimer</a>
            <a href="/#contact">Contact</a>
          </nav>
          <a className="btn primary" href="/registration.html">Registration</a>
        </div>
      </header>

      <section className="register-hero">
        <div className="register-hero-inner">
          <p className="eyebrow">Member Registration</p>
          <h1>Complete Your Matrimony Profile</h1>
          <p>
            Please fill accurate details for faster verification and better profile matching.
            Fields marked with <span className="required-star">*</span> are mandatory.
          </p>
        </div>
      </section>

      <main className="register-main">
        <form className="registration-form" onSubmit={handleSubmit} onInput={handleInput} noValidate>
          <section className="registration-group">
            <h2>1. Personal Information</h2>
            <div className="registration-grid">
              <label>
                <span>Full Name <span className="required-star">*</span></span>
                <input type="text" name="name" required />
              </label>
              <label>
                <span>Email Address <span className="required-star">*</span></span>
                <input
                  type="email"
                  name="email"
                  required
                  className={fieldErrors.email ? "input-error" : ""}
                />
                {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
              </label>
              <label>
                <span>Mobile Number <span className="required-star">*</span></span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91"
                  required
                  className={fieldErrors.phone ? "input-error" : ""}
                />
                {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
              </label>
              <label>
                <span>WhatsApp Number <span className="required-star">*</span></span>
                <input
                  type="tel"
                  name="whatsappNumber"
                  placeholder="+91"
                  required
                  className={fieldErrors.whatsappNumber ? "input-error" : ""}
                />
                {fieldErrors.whatsappNumber && (
                  <span className="field-error">{fieldErrors.whatsappNumber}</span>
                )}
              </label>
              <label>
                <span>Alternate Contact Number (optional)</span>
                <input
                  type="tel"
                  name="alternateContactNumber"
                  placeholder="+91"
                  className={fieldErrors.alternateContactNumber ? "input-error" : ""}
                />
                <span className="field-helper">
                  Optional: add another number for backup contact.
                </span>
                {fieldErrors.alternateContactNumber && (
                  <span className="field-error">{fieldErrors.alternateContactNumber}</span>
                )}
              </label>
              <label>
                <span>Create Password <span className="required-star">*</span></span>
                <input
                  type="password"
                  name="password"
                  minLength="4"
                  required
                  className={fieldErrors.password ? "input-error" : ""}
                />
                {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
              </label>
              <label>
                <span>Re-enter Password <span className="required-star">*</span></span>
                <input
                  type="password"
                  name="confirmPassword"
                  minLength="4"
                  required
                  className={fieldErrors.confirmPassword ? "input-error" : ""}
                />
                {fieldErrors.confirmPassword && (
                  <span className="field-error">{fieldErrors.confirmPassword}</span>
                )}
              </label>
              <label>
                <span>Primary Contact Person Name <span className="required-star">*</span></span>
                <input type="text" name="primaryContactName" required />
              </label>
              <label>
                <span>Relation to User <span className="required-star">*</span></span>
                <select name="primaryContactRelation" required>
                  <option value="">Select</option>
                  {CONTACT_RELATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Gender <span className="required-star">*</span></span>
                <select name="gender" required>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </label>
              <label>
                <span>Date of Birth <span className="required-star">*</span></span>
                <input type="date" name="dob" required />
              </label>
              <label>
                <span>Time of Birth</span>
                <input type="time" name="timeOfBirth" />
              </label>
              <label>
                <span>Place of Birth</span>
                <input type="text" name="placeOfBirth" />
              </label>
              <label>
                <span>Marital Status <span className="required-star">*</span></span>
                <select name="maritalStatus" required>
                  <option value="">Select</option>
                  <option value="Unmarried">Unmarried</option>
                  <option value="Divorcee">Divorcee</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </label>
              <label>
                <span>Height <span className="required-star">*</span></span>
                <select name="height" required>
                  <option value="">Select</option>
                  {HEIGHT_OPTIONS.map((height) => (
                    <option key={height} value={height}>
                      {height}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Weight (kg)</span>
                <input type="number" name="weight" min="30" max="180" />
              </label>
              <label>
                <span>Complexion</span>
                <select name="complexion">
                  <option value="">Select</option>
                  <option value="Fair">Fair</option>
                  <option value="Wheatish">Wheatish</option>
                  <option value="Dark">Dark</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </label>
              <label>
                <span>Mother Tongue <span className="required-star">*</span></span>
                <select name="motherTongue" required>
                  <option value="">Select</option>
                  {MOTHER_TONGUE_OPTIONS.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Other Languages Known</span>
                <input type="text" name="otherLanguages" />
              </label>
              <label>
                <span>Native Place</span>
                <input type="text" name="nativePlace" />
              </label>
              <label>
                <span>Current Location <span className="required-star">*</span></span>
                <input type="text" name="currentLocation" required />
              </label>
              <label className="registration-full">
                <span>Profile Photo Upload (JPG/PNG, max 5MB) <span className="required-star">*</span></span>
                <input
                  type="file"
                  name="profilePhoto"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  required
                  onChange={handleFileChange}
                  className={fieldErrors.profilePhoto ? "input-error" : ""}
                />
                {profileFileName && <span className="file-name">{profileFileName}</span>}
                {fieldErrors.profilePhoto && <span className="field-error">{fieldErrors.profilePhoto}</span>}
              </label>
            </div>
          </section>

          <section className="registration-group">
            <h2>2. Horoscope Details</h2>
            <div className="registration-grid">
              <label>
                <span>Rasi</span>
                <select name="rasi">
                  <option value="">Select</option>
                  {RASI_OPTIONS.map((rasi) => (
                    <option key={rasi} value={rasi}>
                      {rasi}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Nakshatra <span className="required-star">*</span></span>
                <select name="nakshatra" required>
                  <option value="">Select</option>
                  {NAKSHATRA_OPTIONS.map((nakshatra) => (
                    <option key={nakshatra} value={nakshatra}>
                      {nakshatra}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Gothram</span>
                <input type="text" name="gothram" />
              </label>
              <label>
                <span>Sect <span className="required-star">*</span></span>
                <select name="sect" value={sect} onChange={handleInput} required>
                  <option value="">Select</option>
                  {SECT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Subsect <span className="required-star">*</span></span>
                <select
                  name="subsect"
                  value={subsect}
                  onChange={handleInput}
                  disabled={!sect}
                  required={Boolean(sect)}
                  className={fieldErrors.subsect ? "input-error" : ""}
                >
                  <option value="">{sect ? "Select" : "Select sect first"}</option>
                  {(SUBSECT_OPTIONS_BY_SECT[sect] || []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {fieldErrors.subsect && <span className="field-error">{fieldErrors.subsect}</span>}
              </label>
              <div className="registration-full radio-group">
                <span>Horoscope Matching Required? <span className="required-star">*</span></span>
                <div className="inline-options">
                  <label>
                    <input type="radio" name="horoscopeMatchingRequired" value="Yes" required />
                    Yes
                  </label>
                  <label>
                    <input type="radio" name="horoscopeMatchingRequired" value="No" required />
                    No
                  </label>
                </div>
              </div>
              <label className="registration-full">
                <span>Horoscope Upload (PDF/JPG/PNG, max 5MB)</span>
                <input
                  type="file"
                  name="horoscopeFile"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                  className={fieldErrors.horoscopeFile ? "input-error" : ""}
                />
                {horoscopeFileName && <span className="file-name">{horoscopeFileName}</span>}
                {fieldErrors.horoscopeFile && <span className="field-error">{fieldErrors.horoscopeFile}</span>}
              </label>
            </div>
          </section>

          <section className="registration-group">
            <h2>3. Education &amp; Career</h2>
            <div className="registration-grid">
              <label>
                <span>Highest Qualification <span className="required-star">*</span></span>
                <input type="text" name="highestQualification" required />
              </label>
              <label>
                <span>Field of Study</span>
                <input type="text" name="fieldOfStudy" />
              </label>
              <label>
                <span>Occupation <span className="required-star">*</span></span>
                <input type="text" name="occupation" required />
              </label>
              <label>
                <span>Company Name</span>
                <input type="text" name="companyName" />
              </label>
              <label>
                <span>Work Location</span>
                <input type="text" name="workLocation" />
              </label>
              <label>
                <span>Salary <span className="required-star">*</span></span>
                <div className="salary-input-row">
                  <select name="salaryCurrency" defaultValue="INR - Indian Rupee" required>
                    {CURRENCY_OPTIONS.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                  <input type="number" name="salary" min="0" placeholder="Enter amount" required />
                </div>
              </label>
              <label>
                <span>Nature of Work <span className="required-star">*</span></span>
                <select name="natureOfWork" required>
                  <option value="">Select</option>
                  <option value="Banking">Banking</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Engineering">Engineering</option>
                  <option value="IT">IT</option>
                  <option value="Government">Government</option>
                  <option value="Business">Business</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>
                <span>Visa Status (Optional)</span>
                <input type="text" name="visaStatus" />
              </label>
            </div>
          </section>

          <section className="registration-group">
            <h2>4. Family Details</h2>
            <div className="registration-grid">
              <label>
                <span>Father&apos;s Name <span className="required-star">*</span></span>
                <input type="text" name="fatherName" required />
              </label>
              <label>
                <span>Father&apos;s Occupation</span>
                <input type="text" name="fatherOccupation" />
              </label>
              <label>
                <span>Mother&apos;s Name <span className="required-star">*</span></span>
                <input type="text" name="motherName" required />
              </label>
              <label>
                <span>Mother&apos;s Occupation</span>
                <input type="text" name="motherOccupation" />
              </label>
              <label>
                <span>Parents Status <span className="required-star">*</span></span>
                <select name="parentsStatus" required>
                  <option value="">Select</option>
                  <option value="Both Alive">Both Alive</option>
                  <option value="Father Alive">Father Alive</option>
                  <option value="Mother Alive">Mother Alive</option>
                  <option value="Both Deceased">Both Deceased</option>
                </select>
              </label>
              <label>
                <span>Siblings Details</span>
                <input type="text" name="siblingsDetails" placeholder="e.g. 1 Brother, 1 Sister" />
              </label>
              <label>
                <span>Family Status <span className="required-star">*</span></span>
                <select name="familyStatus" required>
                  <option value="">Select</option>
                  <option value="Middle Class">Middle Class</option>
                  <option value="Upper Middle Class">Upper Middle Class</option>
                  <option value="Affluent">Affluent</option>
                </select>
              </label>
              <label className="registration-full">
                <span>Family Property Details</span>
                <textarea name="familyPropertyDetails" rows="3"></textarea>
              </label>
            </div>
          </section>

          <section className="registration-group">
            <h2>5. Lifestyle &amp; Additional Details</h2>
            <div className="registration-grid">
              <label className="registration-full">
                <span>Talents / Achievements</span>
                <textarea name="talents" rows="3"></textarea>
              </label>
              <label className="registration-full">
                <span>Hobbies</span>
                <textarea name="hobbies" rows="3"></textarea>
              </label>
              <label>
                <span>Driving Skills <span className="required-star">*</span></span>
                <select name="drivingSkills" required>
                  <option value="">Select</option>
                  <option value="Two Wheeler">Two Wheeler</option>
                  <option value="Four Wheeler">Four Wheeler</option>
                  <option value="Both">Both</option>
                  <option value="None">None</option>
                </select>
              </label>
              <label className="registration-full">
                <span>About Me <span className="required-star">*</span></span>
                <textarea name="aboutMe" rows="4" required></textarea>
              </label>
            </div>
          </section>

          <section className="registration-group">
            <h2>6. Disability Information</h2>
            <div className="registration-grid">
              <label>
                <span>Do you have a disability? <span className="required-star">*</span></span>
                <select
                  name="disability"
                  value={disability}
                  onChange={handleInput}
                  required
                  className={fieldErrors.disability ? "input-error" : ""}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {fieldErrors.disability && <span className="field-error">{fieldErrors.disability}</span>}
              </label>
              {disability === "Yes" && (
                <>
                  <label>
                    <span>Type of Disability <span className="required-star">*</span></span>
                    <select
                      name="disabilityType"
                      required
                      className={fieldErrors.disabilityType ? "input-error" : ""}
                    >
                      <option value="">Select</option>
                      {DISABILITY_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.disabilityType && (
                      <span className="field-error">{fieldErrors.disabilityType}</span>
                    )}
                  </label>
                  <label>
                    <span>Disability Percentage <span className="required-star">*</span></span>
                    <input
                      type="number"
                      name="disabilityPercentage"
                      min="0"
                      max="100"
                      required
                      className={fieldErrors.disabilityPercentage ? "input-error" : ""}
                    />
                    {fieldErrors.disabilityPercentage && (
                      <span className="field-error">{fieldErrors.disabilityPercentage}</span>
                    )}
                  </label>
                  <label className="registration-full">
                    <span>Upload Doctor Certificate <span className="required-star">*</span></span>
                    <input
                      type="file"
                      name="doctorCertificateFile"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      required
                      onChange={handleFileChange}
                      className={fieldErrors.doctorCertificateFile ? "input-error" : ""}
                    />
                    <span className="field-helper">
                      Please upload a valid government-issued or certified medical disability
                      certificate.
                    </span>
                    {doctorCertificateFileName && (
                      <span className="file-name">{doctorCertificateFileName}</span>
                    )}
                    {fieldErrors.doctorCertificateFile && (
                      <span className="field-error">{fieldErrors.doctorCertificateFile}</span>
                    )}
                  </label>
                  <div className="registration-full disability-benefit">
                    Registration is completely FREE for persons with disability.
                  </div>
                  <input type="hidden" name="free_registration" value="true" />
                </>
              )}
            </div>
          </section>

          <section className="registration-group">
            <h2>7. Partner Expectations</h2>
            <div className="registration-grid">
              <label>
                <span>Preferred Qualification <span className="required-star">*</span></span>
                <input type="text" name="preferredQualification" required />
              </label>
              <label>
                <span>Preferred Occupation <span className="required-star">*</span></span>
                <input type="text" name="preferredOccupation" required />
              </label>
              <label>
                <span>Preferred Location <span className="required-star">*</span></span>
                <input type="text" name="preferredLocation" required />
              </label>
              <label>
                <span>Expected Income Range</span>
                <div className="salary-input-row">
                  <select name="expectedIncomeCurrency" defaultValue="INR - Indian Rupee">
                    {CURRENCY_OPTIONS.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="expectedIncomeRange"
                    placeholder="e.g. 80,000 - 1,20,000 per month"
                  />
                </div>
              </label>
              <label>
                <span>Age Difference Preferred <span className="required-star">*</span></span>
                <select name="ageDifferencePreferred" required>
                  <option value="">Select</option>
                  <option value="1-3 Years">1-3 Years</option>
                  <option value="3-5 Years">3-5 Years</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </label>
              <label>
                <span>Height Preference</span>
                <input type="text" name="heightPreference" />
              </label>
              <label>
                <span>Sect Preference</span>
                <select
                  name="partnerSectPreference"
                  value={partnerSectPreference}
                  onChange={handleInput}
                >
                  <option value="">Select</option>
                  {SECT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Subsect Preference</span>
                <select
                  name="partnerSubsectPreference"
                  value={partnerSubsectPreference}
                  onChange={handleInput}
                  disabled={!partnerSectPreference}
                >
                  <option value="">
                    {partnerSectPreference ? "Select" : "Select sect preference first"}
                  </option>
                  {(SUBSECT_OPTIONS_BY_SECT[partnerSectPreference] || []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="registration-full">
                <span>Additional Expectations</span>
                <textarea name="additionalExpectations" rows="4"></textarea>
              </label>
            </div>
          </section>

          <section className="registration-group">
            <h2>8. Verification Documents</h2>
            <div className="registration-grid">
              <label>
                <span>Government ID Type <span className="required-star">*</span></span>
                <select name="governmentProofType" required>
                  <option value="">Select</option>
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Other Govt ID">Other Govt ID</option>
                </select>
              </label>
              <label className="registration-full">
                <span>Government Proof Upload (PDF/JPG/PNG, max 5MB) <span className="required-star">*</span></span>
                <input
                  type="file"
                  name="governmentProofFile"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  required
                  onChange={handleFileChange}
                  className={fieldErrors.governmentProofFile ? "input-error" : ""}
                />
                {governmentProofFileName && <span className="file-name">{governmentProofFileName}</span>}
                {fieldErrors.governmentProofFile && (
                  <span className="field-error">{fieldErrors.governmentProofFile}</span>
                )}
              </label>
            </div>
          </section>

          <section className="registration-group">
            <h2>9. Referral Code</h2>
            <div className="registration-grid">
              <label className="registration-full referral-field">
                <span>Referral Code (optional)</span>
                <div className="referral-apply-row">
                  <input
                    ref={referralInputRef}
                    type="text"
                    name="referralCode"
                    placeholder="Enter referral code"
                    onBlur={handleReferralBlur}
                    className={fieldErrors.referralCode ? "input-error" : ""}
                  />
                  <button className="referral-apply-btn" type="button" onClick={handleApplyReferral}>
                    Apply
                  </button>
                </div>
                <span className="referral-helper">
                  Enter a referral code if a friend or family member shared one with you.
                  Referral codes may provide benefits for both you and the referrer.
                </span>
                {referralFeedback.message && (
                  <span className={`referral-status ${referralFeedback.status}`}>
                    {referralFeedback.message}
                  </span>
                )}
              </label>
            </div>
          </section>

          <div className="registration-actions">
            <div className="policy-links">
              <a href="/rules.html" target="_blank" rel="noreferrer">
                Read Rules &amp; Guidelines / Disclaimer
              </a>
            </div>
            <label className="acknowledge-check">
              <input type="checkbox" name="policyAcknowledged" required />
              <span>
                I acknowledge that I have read the policies and submit this registration
                with my consent.
              </span>
            </label>
            {formMessage && (
              <p className={`form-message ${formError ? "error" : "success"}`}>{formMessage}</p>
            )}
            <button className="btn primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Registration"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default RegisterApp;
