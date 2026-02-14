import { useEffect, useState } from "react";
import { apiFetch } from "./lib/api";

const SALARY_CURRENCY_OPTIONS = [
  "INR - Indian Rupee",
  "USD - US Dollar",
  "EUR - Euro",
  "GBP - British Pound",
  "AED - UAE Dirham",
  "SGD - Singapore Dollar",
  "AUD - Australian Dollar"
];

const PARENTS_STATUS_OPTIONS = [
  "Both Alive",
  "Father Alive",
  "Mother Alive",
  "Both Deceased"
];

const EXCLUDED_ADDITIONAL_DETAIL_KEYS = new Set([
  "profilePhoto",
  "governmentProofFile",
  "doctorCertificateFile",
  "governmentProofType",
  "referralCode",
  "policyAcknowledged",
  "free_registration",
  "confirmPassword",
  "password",
  "aboutMe",
  "familyPropertyDetails"
]);

const ADDITIONAL_DETAIL_GROUPS = [
  {
    title: "Horoscope",
    keys: ["rasi", "nakshatra", "sect", "subsect", "horoscopeMatchingRequired", "timeOfBirth", "placeOfBirth"]
  },
  {
    title: "Personal",
    keys: [
      "maritalStatus",
      "height",
      "weight",
      "complexion",
      "motherTongue",
      "otherLanguages",
      "nativePlace",
      "currentLocation",
      "drivingSkills",
      "disability"
    ]
  },
  {
    title: "Education & Career",
    keys: [
      "highestQualification",
      "fieldOfStudy",
      "companyName",
      "workLocation",
      "salaryCurrency",
      "salary",
      "natureOfWork",
      "visaStatus"
    ]
  },
  {
    title: "Family",
    keys: [
      "fatherName",
      "fatherOccupation",
      "motherName",
      "motherOccupation",
      "parentsStatus",
      "siblingsDetails",
      "familyStatus"
    ]
  },
  {
    title: "Partner Preferences",
    keys: [
      "preferredQualification",
      "preferredOccupation",
      "preferredLocation",
      "expectedIncomeCurrency",
      "expectedIncomeRange",
      "ageDifferencePreferred",
      "heightPreference",
      "partnerSectPreference",
      "partnerSubsectPreference",
      "additionalExpectations"
    ]
  }
];

const FIELD_LABELS = {
  whatsappNumber: "WhatsApp Number",
  alternateContactNumber: "Alternate Contact Number",
  primaryContactName: "Primary Contact Name",
  primaryContactRelation: "Primary Contact Relation",
  timeOfBirth: "Time of Birth",
  placeOfBirth: "Place of Birth",
  maritalStatus: "Marital Status",
  motherTongue: "Mother Tongue",
  otherLanguages: "Other Languages",
  nativePlace: "Native Place",
  currentLocation: "Current Location",
  horoscopeMatchingRequired: "Horoscope Matching Required",
  highestQualification: "Highest Qualification",
  fieldOfStudy: "Field of Study",
  workLocation: "Work Location",
  salaryCurrency: "Salary Currency",
  natureOfWork: "Nature of Work",
  visaStatus: "Visa Status",
  fatherName: "Father Name",
  fatherOccupation: "Father Occupation",
  motherName: "Mother Name",
  motherOccupation: "Mother Occupation",
  parentsStatus: "Parents Status",
  siblingsDetails: "Siblings Details",
  familyStatus: "Family Status",
  familyPropertyDetails: "Family Property Details",
  drivingSkills: "Driving Skills",
  preferredQualification: "Preferred Qualification",
  preferredOccupation: "Preferred Occupation",
  preferredLocation: "Preferred Location",
  expectedIncomeCurrency: "Expected Income Currency",
  expectedIncomeRange: "Expected Income Range",
  ageDifferencePreferred: "Age Difference Preferred",
  heightPreference: "Height Preference",
  partnerSectPreference: "Partner Sect Preference",
  partnerSubsectPreference: "Partner Subsect Preference",
  additionalExpectations: "Additional Expectations"
};

const toLabel = (key) => FIELD_LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

const hasUsefulValue = (value) => {
  if (value === null || value === undefined) return false;
  const text = String(value).trim();
  if (!text) return false;
  if (text === "-") return false;
  return true;
};

const isSameText = (a, b) =>
  String(a || "").trim().toLowerCase() !== "" &&
  String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

const getGroupedAdditionalDetails = (additionalData = {}) => {
  const groups = [];

  for (const group of ADDITIONAL_DETAIL_GROUPS) {
    const rows = group.keys
      .filter((key) => !EXCLUDED_ADDITIONAL_DETAIL_KEYS.has(key))
      .map((key) => ({ key, value: additionalData[key] }))
      .filter(({ value }) => hasUsefulValue(value))
      .map(({ key, value }) => ({ label: toLabel(key), value: String(value) }));
    if (rows.length > 0) groups.push({ title: group.title, rows });
  }

  const remainingRows = Object.entries(additionalData)
    .filter(([key, value]) => !EXCLUDED_ADDITIONAL_DETAIL_KEYS.has(key) && hasUsefulValue(value))
    .filter(([key]) => !ADDITIONAL_DETAIL_GROUPS.some((group) => group.keys.includes(key)))
    .map(([key, value]) => ({ label: toLabel(key), value: String(value) }));

  if (remainingRows.length > 0) {
    groups.push({ title: "Other Relevant Details", rows: remainingRows });
  }

  return groups;
};

const App = () => {
  const [loginMessage, setLoginMessage] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [memberSession, setMemberSession] = useState(null);
  const [memberView, setMemberView] = useState("matches");
  const [memberLoading, setMemberLoading] = useState(false);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [recentProfiles, setRecentProfiles] = useState([]);
  const [profilesTotal, setProfilesTotal] = useState(0);
  const [profilesPage, setProfilesPage] = useState(1);
  const [profilesTotalPages, setProfilesTotalPages] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedProfileLoading, setSelectedProfileLoading] = useState(false);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);
  const [unlockBusy, setUnlockBusy] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    city: "",
    address: "",
    education: "",
    occupation: "",
    gothram: "",
    message: "",
    extraData: {}
  });
  const [addressMessage, setAddressMessage] = useState("");
  const [addressError, setAddressError] = useState(false);
  const [passwordDraft, setPasswordDraft] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const buildProfileDraft = (member = {}) => ({
    address: member?.address || "",
    occupation: member?.occupation || "",
    message: member?.message || "",
    extraData: { ...(member?.extraData || {}) }
  });

  useEffect(() => {
    const saved = sessionStorage.getItem("vv_member_session");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setMemberSession(parsed);
      setMemberView("matches");
      setProfileDraft(buildProfileDraft(parsed?.member));
    } catch (err) {
      sessionStorage.removeItem("vv_member_session");
    }
  }, []);

  const refreshMemberSession = async (sessionOverride = null) => {
    const source = sessionOverride || memberSession;
    if (!source?.token) return false;

    setMemberLoading(true);
    try {
      const latest = await apiFetch("/member-session", {
        headers: {
          Authorization: `Bearer ${source.token}`
        }
      });
      setMemberSession(latest);
      setProfileDraft(buildProfileDraft(latest?.member));
      return true;
    } catch (err) {
      sessionStorage.removeItem("vv_member_session");
      setMemberSession(null);
      return false;
    } finally {
      setMemberLoading(false);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("vv_member_session");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (!parsed?.token) {
        sessionStorage.removeItem("vv_member_session");
        setMemberSession(null);
        return;
      }
      refreshMemberSession(parsed);
    } catch (err) {
      sessionStorage.removeItem("vv_member_session");
      setMemberSession(null);
    }
  }, []);

  useEffect(() => {
    if (!memberSession) {
      sessionStorage.removeItem("vv_member_session");
      return;
    }
    sessionStorage.setItem("vv_member_session", JSON.stringify(memberSession));
  }, [memberSession]);

  useEffect(() => {
    if (memberSession?.token) {
      fetchRecentProfiles(memberSession);
    }
  }, [memberSession?.token, profilesPage]);

  const handleMemberLogin = async (event) => {
    event.preventDefault();
    setLoginMessage("");
    setLoginError(false);

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      memberId: data.get("memberId"),
      password: data.get("password")
    };

    try {
      const body = await apiFetch("/member-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setMemberSession(body);
      setMemberView("matches");
      setProfilesPage(1);
      setProfileDraft(buildProfileDraft(body?.member));
      setLoginMessage("Login successful");
      form.reset();
    } catch (err) {
      setLoginError(true);
      setLoginMessage(err.message);
    }
  };

  const handleLogout = () => {
    setMemberSession(null);
    setMemberView("matches");
    setLoginError(false);
    setLoginMessage("");
    setProfileDraft(buildProfileDraft({}));
    setAddressMessage("");
    setAddressError(false);
    setPasswordDraft({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordMessage("");
    setPasswordError(false);
    setRecentProfiles([]);
    setProfilesTotal(0);
    setProfilesPage(1);
    setProfilesTotalPages(1);
    setSelectedProfile(null);
    setMatchError("");
    setShowUnlockConfirm(false);
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    if (!memberSession?.token) return;

    setAddressMessage("");
    setAddressError(false);
    try {
      const updatedMember = await apiFetch("/member-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${memberSession.token}`
        },
        body: JSON.stringify({
          address: profileDraft.address,
          occupation: profileDraft.occupation,
          message: profileDraft.message,
          extraData: profileDraft.extraData
        })
      });
      setMemberSession((current) => {
        const next = {
          ...current,
          member: {
            ...current.member,
            ...updatedMember
          }
        };
        setProfileDraft(buildProfileDraft(next.member));
        return next;
      });
      setAddressMessage("Profile updated successfully.");
    } catch (err) {
      setAddressError(true);
      setAddressMessage(err.message);
    }
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    if (!memberSession?.token) return;

    setPasswordMessage("");
    setPasswordError(false);
    if (!passwordDraft.currentPassword || !passwordDraft.newPassword || !passwordDraft.confirmPassword) {
      setPasswordError(true);
      setPasswordMessage("Please fill all password fields.");
      return;
    }
    if (passwordDraft.newPassword.length < 4) {
      setPasswordError(true);
      setPasswordMessage("New password must be at least 4 characters.");
      return;
    }
    if (passwordDraft.newPassword !== passwordDraft.confirmPassword) {
      setPasswordError(true);
      setPasswordMessage("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await apiFetch("/member-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${memberSession.token}`
        },
        body: JSON.stringify({
          currentPassword: passwordDraft.currentPassword,
          newPassword: passwordDraft.newPassword
        })
      });
      setPasswordMessage(response.message || "Password updated successfully.");
      setPasswordDraft({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(true);
      setPasswordMessage(err.message);
    }
  };

  const fetchRecentProfiles = async (sessionOverride = null) => {
    const source = sessionOverride || memberSession;
    if (!source?.token) return;

    setMatchesLoading(true);
    setMatchError("");
    try {
      const data = await apiFetch(`/member-profiles/recent?page=${profilesPage}&pageSize=20`, {
        headers: {
          Authorization: `Bearer ${source.token}`
        }
      });
      setRecentProfiles(data.items || []);
      setProfilesTotal(data.total || 0);
      setProfilesTotalPages(data.totalPages || 1);
      setMemberSession((current) =>
        current
          ? {
              ...current,
              member: {
                ...current.member,
                credits: data.creditsRemaining
              }
            }
          : current
      );
    } catch (err) {
      setMatchError(err.message);
    } finally {
      setMatchesLoading(false);
    }
  };

  const getVisibleProfilePages = () => {
    const pages = [];
    const start = Math.max(1, profilesPage - 1);
    const end = Math.min(profilesTotalPages, profilesPage + 1);

    if (start > 1) pages.push(1);
    if (start > 2) pages.push("...");
    for (let p = start; p <= end; p += 1) pages.push(p);
    if (end < profilesTotalPages - 1) pages.push("...");
    if (end < profilesTotalPages) pages.push(profilesTotalPages);

    return pages;
  };

  const openProfileDetail = async (profileId) => {
    if (!memberSession?.token) return;
    setSelectedProfileLoading(true);
    setMatchError("");
    try {
      const data = await apiFetch(`/member-profiles/${profileId}`, {
        headers: {
          Authorization: `Bearer ${memberSession.token}`
        }
      });
      setSelectedProfile(data);
      setMemberSession((current) =>
        current
          ? {
              ...current,
              member: {
                ...current.member,
                credits: data.creditsRemaining
              }
            }
          : current
      );
      setMemberView("detail");
    } catch (err) {
      setMatchError(err.message);
    } finally {
      setSelectedProfileLoading(false);
    }
  };

  const confirmUnlockProfile = async () => {
    if (!memberSession?.token || !selectedProfile?.profile?.profileId) return;
    setUnlockBusy(true);
    setMatchError("");
    try {
      const data = await apiFetch(
        `/member-profiles/${selectedProfile.profile.profileId}/unlock`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${memberSession.token}`
          }
        }
      );
      setSelectedProfile({
        profile: data.profile,
        fullDetails: data.fullDetails,
        creditsRemaining: data.creditsRemaining
      });
      setRecentProfiles((current) =>
        current.map((item) =>
          item.profileId === data.profile.profileId ? { ...item, unlocked: true } : item
        )
      );
      setMemberSession((current) =>
        current
          ? {
              ...current,
              member: {
                ...current.member,
                credits: data.creditsRemaining
              }
            }
          : current
      );
      setShowUnlockConfirm(false);
    } catch (err) {
      setMatchError(err.message);
    } finally {
      setUnlockBusy(false);
    }
  };

  if (memberSession) {
    return (
      <div className="member-page">
        <header className="site-header">
          <div className="header-inner">
            <div className="brand">
              <div className="brand-mark">
                <img src="/vv-logo.jpg" alt="Vedic Vivaha logo" />
              </div>
              <div>
                <p className="brand-name">Vedic Vivaha</p>
                <p className="brand-tag">
                  {memberView === "profile"
                    ? "My Profile"
                    : memberView === "password"
                      ? "Reset Password"
                      : "Member Profile List"}
                </p>
              </div>
            </div>
            <div className="member-top-actions">
              {memberView !== "matches" && (
                <button
                  className="btn ghost"
                  type="button"
                  onClick={() => setMemberView("matches")}
                >
                  Matches
                </button>
              )}
              <button
                className="btn ghost"
                type="button"
                onClick={async () => {
                  const ok = await refreshMemberSession();
                  if (ok) setMemberView("profile");
                }}
              >
                My Profile
              </button>
              <button className="btn ghost" type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        {memberView === "profile" ? (
          <section className="section member-section">
            <div className="member-profile-shell reveal">
              {memberLoading && <p className="form-note" style={{ marginBottom: "10px" }}>Loading profile...</p>}
              <div className="member-profile-banner">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div>
                    <p className="eyebrow">My Profile</p>
                    <h2>{memberSession.member?.name}</h2>
                    <p>
                      Member ID: <strong>{memberSession.member?.id}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMemberView("password")}
                    className="btn ghost"
                    style={{ padding: "6px 10px", fontSize: "12px", lineHeight: 1.2, minWidth: "auto" }}
                  >
                    Reset Password
                  </button>
                </div>
              </div>
              <div className="member-profile-grid">
                <div className="member-profile-item"><span>Name</span><p>{memberSession.member?.name || "-"}</p></div>
                <div className="member-profile-item"><span>Email</span><p>{memberSession.member?.email || "-"}</p></div>
                <div className="member-profile-item"><span>Phone</span><p>{memberSession.member?.phone || "-"}</p></div>
                <div className="member-profile-item"><span>Gender</span><p>{memberSession.member?.gender || "-"}</p></div>
                <div className="member-profile-item"><span>Date of Birth</span><p>{memberSession.member?.dob || "-"}</p></div>
                <div className="member-profile-item"><span>Height</span><p>{memberSession.member?.extraData?.height || "-"}</p></div>
                <div className="member-profile-item"><span>Parents Name</span><p>{`${memberSession.member?.extraData?.fatherName || "-"} / ${memberSession.member?.extraData?.motherName || "-"}`}</p></div>
                <div className="member-profile-item"><span>Siblings</span><p>{memberSession.member?.extraData?.siblingsDetails || "-"}</p></div>
                <div className="member-profile-item"><span>Credits</span><p>{memberSession.member?.credits ?? 0}</p></div>
              </div>
              <form className="member-address-form" onSubmit={handleProfileUpdate}>
                <div className="member-edit-grid">
                  <label>
                    <span>Occupation (Editable)</span>
                    <input
                      type="text"
                      value={profileDraft.occupation}
                      onChange={(e) =>
                        setProfileDraft((current) => ({ ...current, occupation: e.target.value }))
                      }
                      placeholder="Enter your occupation"
                    />
                  </label>
                  <label>
                    <span>Current Location (Editable)</span>
                    <input
                      type="text"
                      value={String(profileDraft.extraData?.currentLocation || "")}
                      onChange={(e) =>
                        setProfileDraft((current) => ({
                          ...current,
                          extraData: {
                            ...(current.extraData || {}),
                            currentLocation: e.target.value
                          }
                        }))
                      }
                      placeholder="Enter current location"
                    />
                  </label>
                  <label>
                    <span>Work Location (Editable)</span>
                    <input
                      type="text"
                      value={String(profileDraft.extraData?.workLocation || "")}
                      onChange={(e) =>
                        setProfileDraft((current) => ({
                          ...current,
                          extraData: {
                            ...(current.extraData || {}),
                            workLocation: e.target.value
                          }
                        }))
                      }
                      placeholder="Enter work location"
                    />
                  </label>

                  <label>
                    <span>Salary Currency (Editable)</span>
                    <select
                      value={String(profileDraft.extraData?.salaryCurrency || "")}
                      onChange={(e) =>
                        setProfileDraft((current) => ({
                          ...current,
                          extraData: {
                            ...(current.extraData || {}),
                            salaryCurrency: e.target.value
                          }
                        }))
                      }
                    >
                      <option value="">Select</option>
                      {SALARY_CURRENCY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Salary (Editable)</span>
                    <input
                      type="text"
                      value={String(profileDraft.extraData?.salary || "")}
                      onChange={(e) =>
                        setProfileDraft((current) => ({
                          ...current,
                          extraData: {
                            ...(current.extraData || {}),
                            salary: e.target.value
                          }
                        }))
                      }
                      placeholder="Enter salary"
                    />
                  </label>
                  <label>
                    <span>Expected Income Currency (Editable)</span>
                    <select
                      value={String(profileDraft.extraData?.expectedIncomeCurrency || "")}
                      onChange={(e) =>
                        setProfileDraft((current) => ({
                          ...current,
                          extraData: {
                            ...(current.extraData || {}),
                            expectedIncomeCurrency: e.target.value
                          }
                        }))
                      }
                    >
                      <option value="">Select</option>
                      {SALARY_CURRENCY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Expected Income Range (Editable)</span>
                    <input
                      type="text"
                      value={String(profileDraft.extraData?.expectedIncomeRange || "")}
                      onChange={(e) =>
                        setProfileDraft((current) => ({
                          ...current,
                          extraData: {
                            ...(current.extraData || {}),
                            expectedIncomeRange: e.target.value
                          }
                        }))
                      }
                      placeholder="Enter expected income range"
                    />
                  </label>
                  <label>
                    <span>Parents Status (Editable)</span>
                    <select
                      value={String(profileDraft.extraData?.parentsStatus || "")}
                      onChange={(e) =>
                        setProfileDraft((current) => ({
                          ...current,
                          extraData: {
                            ...(current.extraData || {}),
                            parentsStatus: e.target.value
                          }
                        }))
                      }
                    >
                      <option value="">Select</option>
                      {PARENTS_STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Visa Status (Editable)</span>
                    <input
                      type="text"
                      value={String(profileDraft.extraData?.visaStatus || "")}
                      onChange={(e) =>
                        setProfileDraft((current) => ({
                          ...current,
                          extraData: {
                            ...(current.extraData || {}),
                            visaStatus: e.target.value
                          }
                        }))
                      }
                      placeholder="Enter visa status"
                    />
                  </label>

                  <label>
                    <span>Company Name (Editable)</span>
                    <input
                      type="text"
                      value={String(profileDraft.extraData?.companyName || "")}
                      onChange={(e) =>
                        setProfileDraft((current) => ({
                          ...current,
                          extraData: {
                            ...(current.extraData || {}),
                            companyName: e.target.value
                          }
                        }))
                      }
                      placeholder="Enter company name"
                    />
                  </label>
                  <label>
                    <span>Nature of Work (Editable)</span>
                    <input
                      type="text"
                      value={String(profileDraft.extraData?.natureOfWork || "")}
                      onChange={(e) =>
                        setProfileDraft((current) => ({
                          ...current,
                          extraData: {
                            ...(current.extraData || {}),
                            natureOfWork: e.target.value
                          }
                        }))
                      }
                      placeholder="Enter nature of work"
                    />
                  </label>
                  <label className="member-edit-full">
                    <span>Address (Editable)</span>
                    <textarea
                      rows="3"
                      value={profileDraft.address}
                      onChange={(e) =>
                        setProfileDraft((current) => ({ ...current, address: e.target.value }))
                      }
                      placeholder="Enter your address"
                    ></textarea>
                  </label>
                  <label className="member-edit-full">
                    <span>Message (Editable)</span>
                    <textarea
                      rows="3"
                      value={profileDraft.message}
                      onChange={(e) =>
                        setProfileDraft((current) => ({ ...current, message: e.target.value }))
                      }
                      placeholder="Enter your message"
                    ></textarea>
                  </label>
                  <label className="member-edit-full">
                    <span>Additional Expectations (Editable)</span>
                    <textarea
                      rows="3"
                      value={String(profileDraft.extraData?.additionalExpectations || "")}
                      onChange={(e) =>
                        setProfileDraft((current) => ({
                          ...current,
                          extraData: {
                            ...(current.extraData || {}),
                            additionalExpectations: e.target.value
                          }
                        }))
                      }
                      placeholder="Enter additional expectations"
                    ></textarea>
                  </label>
                </div>
                {addressMessage && (
                  <p className={`form-message ${addressError ? "error" : "success"}`}>
                    {addressMessage}
                  </p>
                )}
                <button className="btn primary" type="submit">Update Profile</button>
              </form>
            </div>
          </section>
        ) : memberView === "password" ? (
          <section className="section member-section">
            <div className="member-profile-shell reveal" style={{ maxWidth: "760px" }}>
              <div className="member-profile-banner" style={{ marginBottom: "14px" }}>
                <p className="eyebrow">Reset Password</p>
                <h2>{memberSession.member?.name}</h2>
                <p>
                  Member ID: <strong>{memberSession.member?.id}</strong>
                </p>
              </div>
              <form className="member-address-form" onSubmit={handlePasswordUpdate}>
                <label>
                  <span>Current Password</span>
                  <input
                    type="password"
                    value={passwordDraft.currentPassword}
                    onChange={(e) =>
                      setPasswordDraft((current) => ({ ...current, currentPassword: e.target.value }))
                    }
                    placeholder="Enter current password"
                  />
                </label>
                <label>
                  <span>New Password</span>
                  <input
                    type="password"
                    value={passwordDraft.newPassword}
                    onChange={(e) =>
                      setPasswordDraft((current) => ({ ...current, newPassword: e.target.value }))
                    }
                    placeholder="Enter new password"
                  />
                </label>
                <label>
                  <span>Confirm New Password</span>
                  <input
                    type="password"
                    value={passwordDraft.confirmPassword}
                    onChange={(e) =>
                      setPasswordDraft((current) => ({ ...current, confirmPassword: e.target.value }))
                    }
                    placeholder="Re-enter new password"
                  />
                </label>
                {passwordMessage && (
                  <p className={`form-message ${passwordError ? "error" : "success"}`}>
                    {passwordMessage}
                  </p>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                  <button className="btn ghost" type="button" onClick={() => setMemberView("profile")}>
                    Back to Profile
                  </button>
                  <button className="btn primary" type="submit">Update Password</button>
                </div>
              </form>
            </div>
          </section>
        ) : memberView === "detail" ? (
          <section className="section member-section">
            <div className="member-shell reveal">
              {matchError && (
                <p className="form-message error" style={{ marginBottom: "12px" }}>
                  {matchError}
                </p>
              )}
              {!selectedProfile?.profile && (
                <p className="form-note">Profile details unavailable.</p>
              )}
              {selectedProfile?.profile && (
                <div className="match-detail-shell">
                  <div className="match-detail-head">
                    <img
                      src={
                        selectedProfile.profile.imageUrl ||
                        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={selectedProfile.profile.name}
                      className="match-detail-image"
                    />
                    <div>
                      <p className="eyebrow">Profile Details</p>
                      <h2>{selectedProfile.profile.name}</h2>
                      <p className="form-note">
                        {selectedProfile.profile.age || "-"} yrs · {selectedProfile.profile.city || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="member-profile-grid" style={{ marginTop: "14px" }}>
                    <div className="member-profile-item"><span>Gender</span><p>{selectedProfile.profile.gender || "-"}</p></div>
                    <div className="member-profile-item"><span>Height</span><p>{selectedProfile.profile.height || "-"}</p></div>
                    <div className="member-profile-item"><span>Star / Padham</span><p>{selectedProfile.profile.starPadham || "-"}</p></div>
                    <div className="member-profile-item"><span>Rasi</span><p>{selectedProfile.profile.rasi || "-"}</p></div>
                    <div className="member-profile-item"><span>Nakshatra</span><p>{selectedProfile.profile.nakshatra || "-"}</p></div>
                    <div className="member-profile-item"><span>Sect</span><p>{selectedProfile.profile.sect || "-"}</p></div>
                    <div className="member-profile-item"><span>Subsect</span><p>{selectedProfile.profile.subsect || "-"}</p></div>
                    <div className="member-profile-item"><span>Horoscope Matching</span><p>{selectedProfile.profile.horoscopeMatchingRequired || "-"}</p></div>
                    <div className="member-profile-item"><span>Education</span><p>{selectedProfile.profile.education || "-"}</p></div>
                    <div className="member-profile-item"><span>Occupation</span><p>{selectedProfile.profile.occupation || "-"}</p></div>
                    <div className="member-profile-item"><span>Photo</span><p>{selectedProfile.profile.hasPhoto ? "Available" : "Not Available"}</p></div>
                  </div>

                  {selectedProfile.fullDetails ? (
                    <div className="card full-detail-card" style={{ marginTop: "14px" }}>
                      <h3 style={{ marginBottom: "10px" }}>Full Details</h3>
                      <div className="full-detail-sections">
                        <section className="full-detail-section">
                          <h4>Contact</h4>
                          <table className="profile-detail-table">
                            <tbody>
                              <tr><th>Phone</th><td>{selectedProfile.fullDetails.phone || "-"}</td></tr>
                              <tr><th>Email</th><td>{selectedProfile.fullDetails.email || "-"}</td></tr>
                            </tbody>
                          </table>
                        </section>
                        <section className="full-detail-section">
                          <h4>Personal</h4>
                          <table className="profile-detail-table">
                            <tbody>
                              <tr><th>Date of Birth</th><td>{selectedProfile.fullDetails.dob || "-"}</td></tr>
                              <tr><th>City</th><td>{selectedProfile.fullDetails.city || "-"}</td></tr>
                              <tr><th>Address</th><td>{selectedProfile.fullDetails.address || "-"}</td></tr>
                              <tr><th>Education</th><td>{selectedProfile.fullDetails.education || "-"}</td></tr>
                              <tr><th>Occupation</th><td>{selectedProfile.fullDetails.occupation || "-"}</td></tr>
                              <tr><th>Gothram</th><td>{selectedProfile.fullDetails.gothram || "-"}</td></tr>
                            </tbody>
                          </table>
                        </section>
                        <section className="full-detail-section">
                          <h4>About & Family</h4>
                          <table className="profile-detail-table">
                            <tbody>
                              <tr><th>About</th><td>{selectedProfile.fullDetails.about || "-"}</td></tr>
                              {!isSameText(
                                selectedProfile.fullDetails.familyDetails,
                                selectedProfile.fullDetails.address
                              ) && (
                                <tr><th>Family Details</th><td>{selectedProfile.fullDetails.familyDetails || "-"}</td></tr>
                              )}
                            </tbody>
                          </table>
                        </section>
                        {(() => {
                          const groups = getGroupedAdditionalDetails(selectedProfile.fullDetails.additionalData || {});
                          if (groups.length === 0) return null;
                          return (
                            <section className="full-detail-section">
                              <h4>Additional Details</h4>
                              <div className="additional-groups-grid">
                                {groups.map((group) => (
                                  <div key={group.title} className="additional-group-card">
                                    <h5>{group.title}</h5>
                                    <table className="profile-detail-table">
                                      <tbody>
                                        {group.rows.map((row) => (
                                          <tr key={`${group.title}-${row.label}`}>
                                            <th>{row.label}</th>
                                            <td>{row.value}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ))}
                              </div>
                            </section>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="card" style={{ marginTop: "14px" }}>
                      <h3 style={{ marginBottom: "8px" }}>View Full Details</h3>
                      <p className="form-note">
                        Unlock this profile to view about and family details.
                      </p>
                      <button
                        className="btn primary"
                        type="button"
                        style={{ marginTop: "10px" }}
                        onClick={() => setShowUnlockConfirm(true)}
                      >
                        View Full Details (1 Credit)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="section member-section">
            <div className="member-shell reveal">
              <div className="member-head">
                <div>
                  <p className="eyebrow">Member Dashboard</p>
                  <h2>Recently Added Profiles</h2>
                  <p>
                    Logged in as <strong>{memberSession.member?.name}</strong> (
                    {memberSession.member?.id})
                  </p>
                </div>
                <div className="member-stats">
                  <article className="member-stat">
                    <p className="member-stat-value">{profilesTotal}</p>
                    <p className="member-stat-label">Profiles</p>
                  </article>
                  <article className="member-stat">
                    <p className="member-stat-value">{memberSession.member?.credits ?? 0}</p>
                    <p className="member-stat-label">Credits</p>
                  </article>
                </div>
              </div>
              {matchError && (
                <p className="form-message error" style={{ marginBottom: "12px" }}>
                  {matchError}
                </p>
              )}
              {matchesLoading ? (
                <p className="form-note">Loading profiles...</p>
              ) : (
                <div className="recent-profile-grid">
                  {recentProfiles.map((profile) => (
                    <article
                      key={profile.profileId}
                      className="recent-profile-card"
                      onClick={() => openProfileDetail(profile.profileId)}
                    >
                      <img
                        src={
                          profile.imageUrl ||
                          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={profile.name}
                      />
                      <div className="recent-profile-content">
                        <h3>{profile.name}</h3>
                        <p>{profile.age || "-"} yrs · {profile.city || "-"}</p>
                        <p>{profile.height || "-"} · {profile.starPadham || "-"}</p>
                        <p>{profile.education || "-"}</p>
                        <p>{profile.occupation || "-"}</p>
                        <span className={profile.unlocked ? "unlock-pill yes" : "unlock-pill no"}>
                          {profile.unlocked ? "Unlocked" : "Basic View"}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {!matchesLoading && profilesTotalPages > 0 && (
                <div className="member-pagination">
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => setProfilesPage((p) => Math.max(1, p - 1))}
                    disabled={profilesPage <= 1}
                  >
                    Prev
                  </button>
                  {getVisibleProfilePages().map((p, index) =>
                    p === "..." ? (
                      <span key={`ellipsis-${index}`} className="form-note" style={{ padding: "0 4px" }}>
                        ...
                      </span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        className={p === profilesPage ? "btn primary" : "btn ghost"}
                        type="button"
                        onClick={() => setProfilesPage(p)}
                        style={{ minWidth: "40px", padding: "8px 12px" }}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => setProfilesPage((p) => Math.min(profilesTotalPages, p + 1))}
                    disabled={profilesPage >= profilesTotalPages}
                  >
                    Next
                  </button>
                </div>
              )}
              {selectedProfileLoading && (
                <p className="form-note" style={{ marginTop: "8px" }}>
                  Opening profile...
                </p>
              )}
            </div>
          </section>
        )}
        {showUnlockConfirm && (
          <div className="unlock-modal-overlay" onClick={() => setShowUnlockConfirm(false)}>
            <div className="unlock-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Unlock</h3>
              <p>
                You are about to spend <strong>1 credit</strong> to view full details.
              </p>
              <p className="form-note">
                Remaining credits now: <strong>{memberSession.member?.credits ?? 0}</strong>
              </p>
              <div className="unlock-modal-actions">
                <button className="btn ghost" type="button" onClick={() => setShowUnlockConfirm(false)}>
                  Cancel
                </button>
                <button className="btn primary" type="button" onClick={confirmUnlockProfile} disabled={unlockBusy}>
                  {unlockBusy ? "Unlocking..." : "Confirm Unlock"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark">
              <img src="/vv-logo.jpg" alt="Vedic Vivaha logo" />
            </div>
            <div>
              <p className="brand-name">Vedic Vivaha</p>
              <p className="brand-tag">Sacred matchmaking, guided by tradition.</p>
            </div>
          </div>
          <nav className="nav-links">
            <a href="#home">Home</a>
            <a href="#about">Our Purpose</a>
            <a href="/founder.html">About the Founder</a>
            <a href="#features">Features</a>
            <a href="#tariff">Tariff</a>
            <a href="/registration.html">Registration</a>
            <a href="#profiles">Profiles</a>
            <a href="/rules.html">Rules & Disclaimer</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="btn primary" href="/registration.html">Register Now</a>
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
              <a className="btn primary" href="/registration.html">Create Profile</a>
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
                <p>Use your Member ID generated at registration and your password.</p>
              </div>
              <form className="login-form" onSubmit={handleMemberLogin}>
                <label>
                  <span>Member ID</span>
                  <input
                    type="text"
                    name="memberId"
                    placeholder="e.g. VV-123456"
                    required
                  />
                </label>
                <label>
                  <span>Password</span>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                  />
                </label>
                {loginMessage && (
                  <p className={`form-message ${loginError ? "error" : "success"}`}>
                    {loginMessage}
                  </p>
                )}
                <button className="btn primary" type="submit">Login</button>
              </form>
              <div className="login-links">
                <a href="/register.html">New Registration</a>
                <a href="#contact">Login Procedure</a>
              </div>
            </div>
            <figure className="notice-card wedding-banner reveal delay-1">
              <img
                src="/blessed-union.png"
                alt="Sacred wedding blessing"
                loading="lazy"
              />
            </figure>
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
            <h3>How We Work</h3>
            <p>
              Every profile journey is handled in a structured way: registration review, preference
              mapping, compatibility screening, and guided family introductions.
            </p>
            <div className="signature">
              <div className="signature-line"></div>
              <div>
                <p className="signature-name">Process-led Guidance</p>
                <span>Transparent and family-focused support</span>
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
          <a className="btn ghost" href="/register.html">View all profiles</a>
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
          <a href="#about">Our Purpose</a>
          <a href="/founder.html">About the Founder</a>
          <a href="#features">Features</a>
          <a href="#tariff">Tariff</a>
          <a href="/registration.html">Register</a>
          <a href="/rules.html">Rules & Disclaimer</a>
          <a href="#contact">Contact</a>
        </div>
        <p className="footer-note">2026 © Vedic Vivaha. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
