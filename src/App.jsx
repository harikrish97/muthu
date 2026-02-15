import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./lib/api";
import PublicSharedProfileView from "./components/PublicSharedProfileView";
import ShareModal from "./components/ShareModal";

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

const NATURE_OF_WORK_OPTIONS = [
  "Banking",
  "Doctor",
  "Engineering",
  "IT",
  "Government",
  "Business",
  "Education",
  "Other"
];

const NAKSHATRA_OPTIONS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashirsha",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati"
];

const INLINE_EDITABLE_FIELDS = [
  { key: "occupation", label: "Occupation", scope: "root", type: "text", placeholder: "Enter occupation" },
  { key: "currentLocation", label: "Current Location", scope: "extra", type: "text", placeholder: "Enter current location" },
  { key: "workLocation", label: "Work Location", scope: "extra", type: "text", placeholder: "Enter work location" },
  { key: "companyName", label: "Company Name", scope: "extra", type: "text", placeholder: "Enter company name" },
  { key: "natureOfWork", label: "Nature of Work", scope: "extra", type: "select", options: NATURE_OF_WORK_OPTIONS },
  { key: "salaryCurrency", label: "Salary Currency", scope: "extra", type: "select", options: SALARY_CURRENCY_OPTIONS },
  { key: "salary", label: "Salary", scope: "extra", type: "text", placeholder: "Enter salary" },
  { key: "visaStatus", label: "Visa Status", scope: "extra", type: "text", placeholder: "Enter visa status" },
  { key: "parentsStatus", label: "Parents Status", scope: "extra", type: "select", options: PARENTS_STATUS_OPTIONS },
  { key: "expectedIncomeCurrency", label: "Expected Income Currency", scope: "extra", type: "select", options: SALARY_CURRENCY_OPTIONS },
  { key: "expectedIncomeRange", label: "Expected Income Range", scope: "extra", type: "text", placeholder: "Enter expected income range" },
  { key: "message", label: "Message", scope: "root", type: "textarea", rows: 3, placeholder: "Enter your message" },
  { key: "address", label: "Address", scope: "root", type: "textarea", rows: 3, placeholder: "Enter address" },
  { key: "additionalExpectations", label: "Additional Expectations", scope: "extra", type: "textarea", rows: 3, placeholder: "Enter additional expectations" }
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

const getYearFromDob = (dobValue) => {
  const dob = String(dobValue || "").trim();
  const year = Number(dob.split("-")?.[0]);
  return Number.isInteger(year) && year > 0 ? year : null;
};

const getAgeFromDob = (dobValue) => {
  const dob = String(dobValue || "").trim();
  if (!dob) return null;

  const [year, month, day] = dob.split("-").map((part) => Number(part));
  if (![year, month, day].every((num) => Number.isInteger(num))) return null;

  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDelta = today.getMonth() + 1 - month;
  const dayDelta = today.getDate() - day;
  if (monthDelta < 0 || (monthDelta === 0 && dayDelta < 0)) age -= 1;
  return age >= 0 ? age : null;
};

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

const extractImageFromExtraData = (extraData = {}) => {
  if (!extraData || typeof extraData !== "object") return "";
  if (typeof extraData.imageUrl === "string" && extraData.imageUrl.trim()) return extraData.imageUrl.trim();

  const profilePhoto = extraData.profilePhoto;
  if (typeof profilePhoto === "string" && profilePhoto.trim()) return profilePhoto.trim();
  if (profilePhoto && typeof profilePhoto === "object") {
    for (const key of ["url", "dataUrl", "preview", "path"]) {
      const value = profilePhoto[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return "";
};

const escapeHtml = (value) =>
  String(value ?? "-")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const buildPrintableProfileHtml = ({ title, subtitle, photoUrl, rows }) => {
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value || "-")}</td></tr>`
    )
    .join("");

  const photoHtml = photoUrl
    ? `<img src="${escapeHtml(photoUrl)}" alt="Profile photo" class="print-photo" />`
    : `<div class="print-photo print-photo-placeholder">Photo Not Provided</div>`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #2d2822; margin: 24px; }
    .sheet { max-width: 900px; margin: 0 auto; border: 1px solid #d8cfb9; border-radius: 12px; padding: 22px; }
    .head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 16px; }
    h1 { margin: 0; font-size: 28px; color: #8f1c15; }
    .sub { margin: 8px 0 0; color: #6a6256; font-size: 14px; }
    .print-photo { width: 150px; height: 180px; border-radius: 10px; border: 1px solid #d8cfb9; object-fit: cover; }
    .print-photo-placeholder { display: grid; place-items: center; color: #8b7a60; font-size: 12px; background: #f8f3e7; }
    .watermark { margin-top: 16px; text-align: right; color: rgba(143, 28, 21, 0.5); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #e3dbc7; padding: 10px 12px; text-align: left; vertical-align: top; font-size: 14px; }
    th { width: 220px; background: #faf5ea; color: #6a4a1e; }
    @media print { body { margin: 0; } .sheet { border: none; border-radius: 0; } }
  </style>
</head>
<body>
  <section class="sheet">
    <div class="head">
      <div>
        <h1>${escapeHtml(title)}</h1>
        <p class="sub">${escapeHtml(subtitle)}</p>
      </div>
      ${photoHtml}
    </div>
    <table><tbody>${rowsHtml}</tbody></table>
    <p class="watermark">Vedic Vivaha</p>
  </section>
</body>
</html>`;
};

const JSPDF_CDN_URL = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";

const App = () => {
  const [loginMessage, setLoginMessage] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [memberSession, setMemberSession] = useState(null);
  const [memberView, setMemberView] = useState("matches");
  const [memberLoading, setMemberLoading] = useState(false);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [recentProfiles, setRecentProfiles] = useState([]);
  const [publicRecentProfiles, setPublicRecentProfiles] = useState([]);
  const [publicProfilesLoading, setPublicProfilesLoading] = useState(true);
  const [publicProfilesError, setPublicProfilesError] = useState("");
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
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [nakshatraFilter, setNakshatraFilter] = useState("");
  const [birthFilterMode, setBirthFilterMode] = useState("none");
  const [yearOfBirthFilter, setYearOfBirthFilter] = useState("");
  const [ageMinFilter, setAgeMinFilter] = useState("");
  const [ageMaxFilter, setAgeMaxFilter] = useState("");
  const [excludeSameGotra, setExcludeSameGotra] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareMeta, setShareMeta] = useState(null);
  const [shareMessage, setShareMessage] = useState("");
  const [shareMessageError, setShareMessageError] = useState(false);
  const [shareToast, setShareToast] = useState("");
  const [shareToastError, setShareToastError] = useState(false);
  const [shareExpiresInDays, setShareExpiresInDays] = useState(7);
  const [shareIncludeContactDetails, setShareIncludeContactDetails] = useState(false);
  const [editingFieldKey, setEditingFieldKey] = useState("");
  const [editingValue, setEditingValue] = useState("");
  const [inlineSaveBusy, setInlineSaveBusy] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoSaveBusy, setPhotoSaveBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const sharedRouteToken = useMemo(() => {
    if (typeof window === "undefined") return null;
    const match = window.location.pathname.match(/^\/profile\/share\/([^/]+)\/?$/);
    return match ? decodeURIComponent(match[1]) : null;
  }, []);

  // Requirement fallback: if member gothram is unavailable, use Bharadwaj.
  const loggedInUserGotra = memberSession?.member?.gothram || "Bharadwaj";

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const clearAllFilters = () => {
    setGlobalSearchQuery("");
    setDebouncedSearchQuery("");
    setNakshatraFilter("");
    setBirthFilterMode("none");
    setYearOfBirthFilter("");
    setAgeMinFilter("");
    setAgeMaxFilter("");
    setExcludeSameGotra(false);
  };

  const buildProfileDraft = (member = {}) => ({
    address: member?.address || "",
    occupation: member?.occupation || "",
    message: member?.message || "",
    extraData: { ...(member?.extraData || {}) }
  });

  const getEditableFieldCurrentValue = (field) => {
    if (!field) return "";
    if (field.scope === "root") {
      return String(profileDraft?.[field.key] ?? memberSession?.member?.[field.key] ?? "");
    }
    return String(
      profileDraft?.extraData?.[field.key] ?? memberSession?.member?.extraData?.[field.key] ?? ""
    );
  };

  // Inline edit starts by switching one specific field from read-only to input mode.
  const startInlineEdit = (field) => {
    setAddressMessage("");
    setAddressError(false);
    setEditingFieldKey(field.key);
    setEditingValue(getEditableFieldCurrentValue(field));
  };

  const cancelInlineEdit = () => {
    setEditingFieldKey("");
    setEditingValue("");
  };

  const applyUpdatedMemberToState = (updatedMember) => {
    setMemberSession((current) =>
      current
        ? {
            ...current,
            member: {
              ...current.member,
              ...updatedMember
            }
          }
        : current
    );
    setProfileDraft(buildProfileDraft(updatedMember));
  };

  // Save only the active inline field; all other fields remain read-only.
  const saveInlineEdit = async (field) => {
    if (!memberSession?.token || !field || inlineSaveBusy) return;
    setInlineSaveBusy(true);
    setAddressMessage("");
    setAddressError(false);

    const normalizedValue = field.type === "textarea" || field.type === "text" ? editingValue.trim() : editingValue;
    const payload =
      field.scope === "root"
        ? { [field.key]: normalizedValue }
        : { extraData: { [field.key]: normalizedValue } };

    try {
      const updatedMember = await apiFetch("/member-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${memberSession.token}`
        },
        body: JSON.stringify(payload)
      });
      applyUpdatedMemberToState(updatedMember);
      setAddressMessage(`${field.label} updated successfully.`);
      setAddressError(false);
      cancelInlineEdit();
    } catch (err) {
      setAddressMessage(err.message || "Unable to update field");
      setAddressError(true);
    } finally {
      setInlineSaveBusy(false);
    }
  };

  const openPhotoModal = () => {
    const currentPhoto = extractImageFromExtraData(memberSession?.member?.extraData || {});
    setPhotoPreview(currentPhoto);
    setPhotoError("");
    setPhotoModalOpen(true);
  };

  const handlePhotoFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setPhotoError("Photo must be 5MB or less.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a JPG or PNG image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(String(reader.result || ""));
      setPhotoError("");
    };
    reader.onerror = () => {
      setPhotoError("Unable to read selected image.");
    };
    reader.readAsDataURL(file);
  };

  const savePhotoUpdate = async () => {
    if (!memberSession?.token || photoSaveBusy) return;
    setPhotoSaveBusy(true);
    setPhotoError("");
    try {
      const updatedMember = await apiFetch("/member-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${memberSession.token}`
        },
        body: JSON.stringify({
          extraData: {
            profilePhoto: photoPreview
          }
        })
      });
      applyUpdatedMemberToState(updatedMember);
      setAddressMessage("Profile photo updated successfully.");
      setAddressError(false);
      setPhotoModalOpen(false);
    } catch (err) {
      setPhotoError(err.message || "Unable to update profile photo.");
    } finally {
      setPhotoSaveBusy(false);
    }
  };

  const showShareToastMessage = (message, isError = false) => {
    setShareToast(message);
    setShareToastError(isError);
  };

  const resolveShareStatus = (meta) => {
    if (!meta) return "inactive";
    const statusValue = String(meta.linkStatus || "inactive").toLowerCase();
    if (statusValue !== "active") return statusValue;
    if (!meta.expiresAt) return "active";
    return new Date(meta.expiresAt).getTime() > Date.now() ? "active" : "expired";
  };

  const getMemberPrintableSnapshot = () => {
    const member = memberSession?.member || {};
    const extraData = member.extraData || {};
    const location = member.city || extraData.currentLocation || "-";
    const occupation = member.occupation || extraData.natureOfWork || "-";
    const qualification = member.education || extraData.highestQualification || "-";
    const about = member.message || extraData.aboutMe || "-";
    const familyInfo = extraData.familyPropertyDetails || "-";

    return {
      title: `${member.name || "Member"} - Matrimony Biodata`,
      subtitle: "Vedic Vivaha Profile Summary",
      photoUrl: extractImageFromExtraData(extraData),
      rows: [
        ["Name", member.name || "-"],
        ["Member ID", member.id || "-"],
        ["Gender", member.gender || "-"],
        ["Date of Birth", member.dob || "-"],
        ["Phone", member.phone || "-"],
        ["Email", member.email || "-"],
        ["Location", location || "-"],
        ["Education", qualification || "-"],
        ["Occupation", occupation || "-"],
        ["Gothram", member.gothram || "-"],
        ["Nakshatra", extraData.nakshatra || "-"],
        ["Sect / Subsect", [extraData.sect, extraData.subsect].filter(Boolean).join(" / ") || "-"],
        ["About", about || "-"],
        ["Family Details", familyInfo || "-"]
      ]
    };
  };

  const openPrintableWindow = (snapshot, shouldPromptPdf = false) => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=950,height=900");
    if (!printWindow) {
      showShareToastMessage("Popup blocked. Please allow popups and try again.", true);
      return;
    }
    printWindow.document.open();
    printWindow.document.write(buildPrintableProfileHtml(snapshot));
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      if (shouldPromptPdf) {
        showShareToastMessage("Print dialog opened. Choose 'Save as PDF' to download.", false);
      }
    }, 200);
  };

  const handlePrintProfile = () => {
    window.print();
  };

  const loadJsPdfLibrary = async () => {
    if (window.jspdf?.jsPDF) {
      return window.jspdf.jsPDF;
    }

    await new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-vv-lib="jspdf"]`);
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", () => reject(new Error("Unable to load PDF library")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = JSPDF_CDN_URL;
      script.async = true;
      script.dataset.vvLib = "jspdf";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Unable to load PDF library"));
      document.head.appendChild(script);
    });

    if (!window.jspdf?.jsPDF) {
      throw new Error("PDF library unavailable");
    }
    return window.jspdf.jsPDF;
  };

  const toImageDataUrl = async (imageUrl) => {
    if (!imageUrl) return "";
    if (String(imageUrl).startsWith("data:image/")) return imageUrl;

    return new Promise((resolve) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0);
          resolve(canvas.toDataURL("image/jpeg", 0.92));
        } catch {
          resolve("");
        }
      };
      image.onerror = () => resolve("");
      image.src = imageUrl;
    });
  };

  const createShareLink = async () => {
    if (!memberSession?.token) throw new Error("Please login again.");

    setShareBusy(true);
    setShareMessage("");
    setShareMessageError(false);
    try {
      const data = await apiFetch("/profile/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${memberSession.token}`
        },
        body: JSON.stringify({
          expiresInDays: shareExpiresInDays,
          includeContactDetails: shareIncludeContactDetails
        })
      });
      setShareMeta(data);
      setShareMessage("Secure share link generated.");
      setShareMessageError(false);
      return data;
    } catch (err) {
      setShareMessage(err.message || "Unable to generate share link");
      setShareMessageError(true);
      throw err;
    } finally {
      setShareBusy(false);
    }
  };

  const getShareUrl = (meta) => {
    if (!meta?.sharePath) return "";
    return `${window.location.origin}${meta.sharePath}`;
  };

  const ensureActiveShareLink = async () => {
    const currentStatus = resolveShareStatus(shareMeta);
    if (currentStatus === "active" && shareMeta?.sharePath) {
      return { meta: shareMeta, url: getShareUrl(shareMeta) };
    }
    const created = await createShareLink();
    return { meta: created, url: getShareUrl(created) };
  };

  const handleCopyShareLink = async () => {
    try {
      const { url } = await ensureActiveShareLink();
      if (!url) throw new Error("Share link unavailable");

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const el = document.createElement("textarea");
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      showShareToastMessage("Share link copied.");
    } catch (err) {
      showShareToastMessage(err.message || "Unable to copy link", true);
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      const { url } = await ensureActiveShareLink();
      const text = `Please review this matrimonial profile: ${url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    } catch (err) {
      showShareToastMessage(err.message || "Unable to prepare WhatsApp share", true);
    }
  };

  const handleShareEmail = async () => {
    try {
      const { url } = await ensureActiveShareLink();
      const memberName = memberSession?.member?.name || "Member";
      const subject = `Matrimony Profile – ${memberName}`;
      const body = `Please review this matrimonial profile:\n\n${url}`;
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } catch (err) {
      showShareToastMessage(err.message || "Unable to prepare email share", true);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const snapshot = getMemberPrintableSnapshot();
      const JsPdf = await loadJsPdfLibrary();
      const doc = new JsPdf({ unit: "pt", format: "a4" });

      doc.setFont("times", "bold");
      doc.setFontSize(22);
      doc.text("Vedic Vivaha - Profile Biodata", 40, 50);

      doc.setFont("times", "normal");
      doc.setFontSize(12);
      doc.text(snapshot.subtitle, 40, 70);

      const imageDataUrl = await toImageDataUrl(snapshot.photoUrl);
      if (imageDataUrl) {
        doc.addImage(imageDataUrl, "JPEG", 420, 40, 130, 160);
      } else {
        doc.setDrawColor(200, 190, 170);
        doc.rect(420, 40, 130, 160);
        doc.setFontSize(10);
        doc.text("Photo unavailable", 445, 120);
        doc.setFontSize(12);
      }

      let y = 95;
      const labelX = 40;
      const valueX = 185;
      const rowHeight = 22;
      const valueWrapWidth = 360;

      snapshot.rows.forEach(([label, value]) => {
        if (y > 760) {
          doc.addPage();
          y = 60;
        }
        const safeValue = String(value || "-");
        const wrapped = doc.splitTextToSize(safeValue, valueWrapWidth);
        const lineCount = Math.max(1, wrapped.length);
        const rowBlockHeight = Math.max(rowHeight, 16 * lineCount);

        doc.setFont("times", "bold");
        doc.text(`${label}:`, labelX, y);
        doc.setFont("times", "normal");
        doc.text(wrapped, valueX, y);
        y += rowBlockHeight;
      });

      doc.setFontSize(10);
      doc.setTextColor(130, 110, 90);
      doc.text("Generated by Vedic Vivaha", 40, 810);
      doc.save(`${(memberSession?.member?.id || "profile").replace(/[^\w-]/g, "_")}.pdf`);
      showShareToastMessage("PDF downloaded.");
    } catch (err) {
      showShareToastMessage(err.message || "Unable to generate PDF. Opening print dialog instead.", true);
      const snapshot = getMemberPrintableSnapshot();
      openPrintableWindow(snapshot, true);
    }
  };

  const handleRevokeShareLink = async () => {
    if (!memberSession?.token || !shareMeta?.token) return;
    setShareBusy(true);
    setShareMessage("");
    setShareMessageError(false);
    try {
      const data = await apiFetch(`/profile/share/${encodeURIComponent(shareMeta.token)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${memberSession.token}`
        }
      });
      setShareMeta((current) => ({
        ...(current || {}),
        linkStatus: data.linkStatus || "revoked"
      }));
      setShareMessage(data.message || "Share link disabled");
      showShareToastMessage("Share link disabled.");
    } catch (err) {
      setShareMessage(err.message || "Unable to disable link");
      setShareMessageError(true);
      showShareToastMessage(err.message || "Unable to disable link", true);
    } finally {
      setShareBusy(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(globalSearchQuery);
    }, 180);
    return () => clearTimeout(timer);
  }, [globalSearchQuery]);

  useEffect(() => {
    if (!shareToast) return;
    const timer = setTimeout(() => {
      setShareToast("");
      setShareToastError(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [shareToast]);

  useEffect(() => {
    if (memberView !== "profile") {
      cancelInlineEdit();
      setPhotoModalOpen(false);
      setPhotoError("");
    }
  }, [memberView]);

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

  const isPublicFeedRunning = publicRecentProfiles.length > 1;
  const publicFeedItems = isPublicFeedRunning
    ? [...publicRecentProfiles, ...publicRecentProfiles]
    : publicRecentProfiles;

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

  useEffect(() => {
    let cancelled = false;
    const fetchPublicProfiles = async () => {
      setPublicProfilesLoading(true);
      setPublicProfilesError("");
      try {
        const data = await apiFetch("/public/profiles/recent-verified?limit=6");
        if (!cancelled) {
          setPublicRecentProfiles(data.items || []);
        }
      } catch (err) {
        if (!cancelled) {
          setPublicProfilesError(err.message || "Unable to load profiles");
        }
      } finally {
        if (!cancelled) {
          setPublicProfilesLoading(false);
        }
      }
    };
    fetchPublicProfiles();
    return () => {
      cancelled = true;
    };
  }, []);

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
      clearAllFilters();
      setIsAdvancedSearchOpen(false);
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
    clearAllFilters();
    setIsAdvancedSearchOpen(false);
    setShowShareModal(false);
    setShareBusy(false);
    setShareMeta(null);
    setShareMessage("");
    setShareMessageError(false);
    setShareToast("");
    setShareToastError(false);
    setShareIncludeContactDetails(false);
    setShareExpiresInDays(7);
    setEditingFieldKey("");
    setEditingValue("");
    setInlineSaveBusy(false);
    setPhotoModalOpen(false);
    setPhotoPreview("");
    setPhotoSaveBusy(false);
    setPhotoError("");
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

  const hasActiveSearchOrFilter = Boolean(
    debouncedSearchQuery.trim() ||
      nakshatraFilter ||
      (birthFilterMode === "year" && yearOfBirthFilter) ||
      (birthFilterMode === "age" && (ageMinFilter || ageMaxFilter)) ||
      excludeSameGotra
  );

  // useMemo keeps filtering + sorting work cheap for large datasets.
  const filteredRecentProfiles = useMemo(() => {
    const searchValue = debouncedSearchQuery.trim().toLowerCase();
    const selectedNakshatra = nakshatraFilter.trim().toLowerCase();
    const selectedYear = Number(yearOfBirthFilter);
    const minAge = ageMinFilter !== "" ? Number(ageMinFilter) : null;
    const maxAge = ageMaxFilter !== "" ? Number(ageMaxFilter) : null;
    const myGotra = String(loggedInUserGotra || "").trim().toLowerCase();

    const filtered = recentProfiles.filter((profile) => {
      const profileId = String(profile.profileId || "").trim();
      const profileName = String(profile.name || "").trim().toLowerCase();
      const profileLocation = String(profile.city || profile.location || "").trim().toLowerCase();
      const idExactMatch = profileId.toLowerCase() === searchValue;

      // Global search supports exact Profile ID and partial Name/Location matches.
      if (
        searchValue &&
        !idExactMatch &&
        !profileName.includes(searchValue) &&
        !profileLocation.includes(searchValue)
      ) {
        return false;
      }

      const nakshatraValue = String(
        profile.nakshatra || String(profile.starPadham || "").split("-")[0]
      )
        .trim()
        .toLowerCase();

      if (selectedNakshatra && nakshatraValue !== selectedNakshatra) {
        return false;
      }

      const profileYear = getYearFromDob(profile.dob);
      const profileAge = getAgeFromDob(profile.dob);

      if (birthFilterMode === "year" && yearOfBirthFilter) {
        if (!Number.isInteger(selectedYear) || profileYear !== selectedYear) {
          return false;
        }
      }

      if (birthFilterMode === "age") {
        if (minAge !== null) {
          if (!Number.isFinite(minAge) || profileAge === null || profileAge < minAge) {
            return false;
          }
        }
        if (maxAge !== null) {
          if (!Number.isFinite(maxAge) || profileAge === null || profileAge > maxAge) {
            return false;
          }
        }
      }

      if (excludeSameGotra) {
        const profileGotra = String(profile.gothram || "").trim().toLowerCase();
        if (myGotra && profileGotra && profileGotra === myGotra) {
          return false;
        }
      }

      return true;
    });

    const decorated = filtered.map((profile) => ({
      ...profile,
      isExactProfileIdMatch:
        Boolean(searchValue) &&
        String(profile.profileId || "").trim().toLowerCase() === searchValue
    }));

    // Exact profile ID match is prioritized to appear first in results.
    decorated.sort((a, b) => Number(b.isExactProfileIdMatch) - Number(a.isExactProfileIdMatch));
    return decorated;
  }, [
    recentProfiles,
    debouncedSearchQuery,
    nakshatraFilter,
    birthFilterMode,
    yearOfBirthFilter,
    ageMinFilter,
    ageMaxFilter,
    excludeSameGotra,
    loggedInUserGotra
  ]);

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

  const memberPhoto =
    extractImageFromExtraData(memberSession?.member?.extraData || {}) ||
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80";
  const memberPhotoAvailable = Boolean(extractImageFromExtraData(memberSession?.member?.extraData || {}));

  const readonlyProfileFields = [
    { key: "name", label: "Name", value: memberSession?.member?.name || "-" },
    { key: "member-id", label: "Member ID", value: memberSession?.member?.id || "-" },
    { key: "email", label: "Email", value: memberSession?.member?.email || "-" },
    { key: "phone", label: "Phone", value: memberSession?.member?.phone || "-" },
    { key: "gender", label: "Gender", value: memberSession?.member?.gender || "-" },
    { key: "dob", label: "Date of Birth", value: memberSession?.member?.dob || "-" },
    { key: "height", label: "Height", value: memberSession?.member?.extraData?.height || "-" },
    {
      key: "parents",
      label: "Parents Name",
      value: `${memberSession?.member?.extraData?.fatherName || "-"} / ${memberSession?.member?.extraData?.motherName || "-"}`
    },
    { key: "siblings", label: "Siblings", value: memberSession?.member?.extraData?.siblingsDetails || "-" },
    { key: "credits", label: "Credits", value: memberSession?.member?.credits ?? 0 }
  ];

  if (sharedRouteToken) {
    return <PublicSharedProfileView token={sharedRouteToken} />;
  }

  if (memberSession) {
    return (
      <div className="member-page">
        <header className="site-header no-print">
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
              <button
                className="btn ghost"
                type="button"
                onClick={() => setMemberView("matches")}
                title="Go to dashboard"
              >
                <span aria-hidden="true">🏠</span>
                Dashboard
              </button>
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
              <div className="profile-photo-shell">
                <div className="profile-photo-frame">
                  <img src={memberPhoto} alt={`${memberSession.member?.name} profile`} />
                  <button
                    className="profile-photo-edit-btn no-print"
                    type="button"
                    onClick={openPhotoModal}
                    aria-label="Edit profile photo"
                    title="Edit profile photo"
                  >
                    📷
                  </button>
                </div>
                <p className="form-note">
                  {memberPhotoAvailable ? "Profile photo uploaded" : "Add your profile photo"}
                </p>
              </div>
              <div className="member-profile-banner">
                <div className="profile-banner-head">
                  <div>
                    <p className="eyebrow">My Profile</p>
                    <h2>{memberSession.member?.name}</h2>
                    <p>
                      Member ID: <strong>{memberSession.member?.id}</strong>
                    </p>
                  </div>
                  <div className="profile-quick-actions no-print">
                    <button
                      type="button"
                      onClick={handlePrintProfile}
                      className="btn ghost profile-quick-btn"
                    >
                      <span aria-hidden="true">🖨</span>
                      Print Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowShareModal(true);
                        setShareMessage("");
                        setShareMessageError(false);
                      }}
                      className="btn ghost profile-quick-btn"
                    >
                      <span aria-hidden="true">🔗</span>
                      Share Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberView("password")}
                      className="btn ghost profile-quick-btn"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              </div>

              <section className="member-profile-readonly">
                <h3>Profile Summary</h3>
                <div className="member-profile-grid">
                  {readonlyProfileFields.map((field) => (
                    <div className="member-profile-item readonly" key={field.key}>
                      <span>{field.label}</span>
                      <p>{field.value || "-"}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="member-inline-edit-shell no-print">
                <h3>Update Details</h3>
                <div className="inline-edit-grid">
                  {INLINE_EDITABLE_FIELDS.map((field) => {
                    const isEditing = editingFieldKey === field.key;
                    const value = getEditableFieldCurrentValue(field);
                    return (
                      <article className="inline-field-card" key={field.key}>
                        <label>{field.label}</label>
                        {!isEditing ? (
                          <div className="inline-field-readonly">
                            <span>{value || "-"}</span>
                            <button
                              type="button"
                              className="inline-icon-btn"
                              onClick={() => startInlineEdit(field)}
                              aria-label={`Edit ${field.label}`}
                              title={`Edit ${field.label}`}
                            >
                              ✎
                            </button>
                          </div>
                        ) : (
                          <div className="inline-field-editing">
                            {field.type === "select" ? (
                              <select
                                value={editingValue}
                                onChange={(event) => setEditingValue(event.target.value)}
                                autoFocus
                              >
                                <option value="">Select</option>
                                {(field.options || []).map((option) => (
                                  <option value={option} key={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : field.type === "textarea" ? (
                              <textarea
                                rows={field.rows || 3}
                                value={editingValue}
                                onChange={(event) => setEditingValue(event.target.value)}
                                placeholder={field.placeholder || ""}
                                autoFocus
                              />
                            ) : (
                              <input
                                type="text"
                                value={editingValue}
                                onChange={(event) => setEditingValue(event.target.value)}
                                placeholder={field.placeholder || ""}
                                autoFocus
                              />
                            )}
                            <div className="inline-edit-actions">
                              <button
                                type="button"
                                className="inline-icon-btn save"
                                onClick={() => saveInlineEdit(field)}
                                disabled={inlineSaveBusy}
                                aria-label={`Save ${field.label}`}
                                title="Save"
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                className="inline-icon-btn cancel"
                                onClick={cancelInlineEdit}
                                disabled={inlineSaveBusy}
                                aria-label={`Cancel ${field.label}`}
                                title="Cancel"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
                {addressMessage && (
                  <p className={`form-message ${addressError ? "error" : "success"}`}>
                    {addressMessage}
                  </p>
                )}
              </section>
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
              <div className="global-search-row">
                <label className="global-search-input">
                  <span>Search Profiles</span>
                  <input
                    type="search"
                    placeholder="Search by Profile ID, Name, or Location"
                    value={globalSearchQuery}
                    onChange={(event) => setGlobalSearchQuery(event.target.value)}
                  />
                </label>
                <button className="btn ghost" type="button" onClick={clearAllFilters}>
                  Clear All Filters
                </button>
              </div>
              <div className="advanced-search-shell">
                <button
                  className="advanced-search-toggle"
                  type="button"
                  onClick={() => setIsAdvancedSearchOpen((open) => !open)}
                  aria-expanded={isAdvancedSearchOpen}
                >
                  {isAdvancedSearchOpen ? "Hide Advanced Search" : "Show Advanced Search"}
                </button>
                {isAdvancedSearchOpen && (
                  <div className="advanced-search-panel">
                    <div className="advanced-search-grid">
                      <label>
                        <span>Matching Star (Nakshatra)</span>
                        <select
                          value={nakshatraFilter}
                          onChange={(event) => setNakshatraFilter(event.target.value)}
                        >
                          <option value="">All Nakshatras</option>
                          {NAKSHATRA_OPTIONS.map((nakshatra) => (
                            <option key={nakshatra} value={nakshatra}>
                              {nakshatra}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span>Birth Filter Mode</span>
                        <select
                          value={birthFilterMode}
                          onChange={(event) => {
                            const mode = event.target.value;
                            setBirthFilterMode(mode);
                            setYearOfBirthFilter("");
                            setAgeMinFilter("");
                            setAgeMaxFilter("");
                          }}
                        >
                          <option value="none">No Birth Filter</option>
                          <option value="year">Exact Year of Birth</option>
                          <option value="age">Age Range</option>
                        </select>
                      </label>

                      {birthFilterMode === "year" && (
                        <label>
                          <span>Year of Birth</span>
                          <input
                            type="number"
                            min="1900"
                            max="2100"
                            placeholder="e.g. 1997"
                            value={yearOfBirthFilter}
                            onChange={(event) => setYearOfBirthFilter(event.target.value)}
                          />
                        </label>
                      )}

                      {birthFilterMode === "age" && (
                        <div className="advanced-age-row">
                          <label>
                            <span>Min Age</span>
                            <input
                              type="number"
                              min="18"
                              max="100"
                              placeholder="Min"
                              value={ageMinFilter}
                              onChange={(event) => setAgeMinFilter(event.target.value)}
                            />
                          </label>
                          <label>
                            <span>Max Age</span>
                            <input
                              type="number"
                              min="18"
                              max="100"
                              placeholder="Max"
                              value={ageMaxFilter}
                              onChange={(event) => setAgeMaxFilter(event.target.value)}
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    <label className="advanced-check">
                      <input
                        type="checkbox"
                        checked={excludeSameGotra}
                        onChange={(event) => setExcludeSameGotra(event.target.checked)}
                      />
                      <span>Exclude profiles with same Gotra as mine ({loggedInUserGotra})</span>
                    </label>

                    <div className="advanced-search-actions">
                      <p className="advanced-result-count">
                        Showing {filteredRecentProfiles.length} of {profilesTotal || recentProfiles.length} profiles
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {matchesLoading ? (
                <p className="form-note">Loading profiles...</p>
              ) : filteredRecentProfiles.length === 0 ? (
                <div className="no-profiles-state">
                  <p>No Profiles Found</p>
                  <span>Try changing or clearing filters to see more results.</span>
                </div>
              ) : (
                <div className="recent-profile-grid">
                  {filteredRecentProfiles.map((profile) => (
                    <article
                      key={profile.profileId}
                      className={`recent-profile-card ${profile.isExactProfileIdMatch ? "exact-id-match" : ""}`}
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
                        <p>{profile.nakshatra || "-"} · {profile.gothram || "-"}</p>
                        <p>{profile.education || "-"}</p>
                        <p>{profile.occupation || "-"}</p>
                        <span className={profile.unlocked ? "unlock-pill yes" : "unlock-pill no"}>
                          {profile.unlocked ? "Unlocked" : "Basic View"}
                        </span>
                        {profile.isExactProfileIdMatch && (
                          <span className="exact-match-pill">Exact Profile ID Match</span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {!matchesLoading && !hasActiveSearchOrFilter && profilesTotalPages > 0 && (
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
        {photoModalOpen && (
          <div className="photo-modal-overlay" onClick={() => setPhotoModalOpen(false)}>
            <div className="photo-modal" onClick={(event) => event.stopPropagation()}>
              <h3>Edit Profile Photo</h3>
              <p className="form-note">Upload JPG/PNG image (max 5MB).</p>
              <div className="photo-modal-preview">
                <img src={photoPreview || memberPhoto} alt="Profile preview" />
              </div>
              <input type="file" accept="image/png,image/jpeg" onChange={handlePhotoFileChange} />
              {photoError && <p className="form-message error">{photoError}</p>}
              <div className="photo-modal-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setPhotoPreview("");
                    setPhotoError("");
                  }}
                  disabled={photoSaveBusy}
                >
                  Remove
                </button>
                <button type="button" className="btn ghost" onClick={() => setPhotoModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn primary" onClick={savePhotoUpdate} disabled={photoSaveBusy}>
                  {photoSaveBusy ? "Saving..." : "Save Photo"}
                </button>
              </div>
            </div>
          </div>
        )}
        {shareToast && (
          <div className={`share-toast ${shareToastError ? "error" : "success"}`}>{shareToast}</div>
        )}
        <ShareModal
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareUrl={getShareUrl(shareMeta)}
          shareStatus={resolveShareStatus(shareMeta)}
          expiresAt={shareMeta?.expiresAt}
          includeContactDetails={shareIncludeContactDetails}
          onToggleIncludeContactDetails={setShareIncludeContactDetails}
          expiresInDays={shareExpiresInDays}
          onChangeExpiresInDays={setShareExpiresInDays}
          onGenerateLink={createShareLink}
          onCopyLink={handleCopyShareLink}
          onShareWhatsApp={handleShareWhatsApp}
          onShareEmail={handleShareEmail}
          onDownloadPdf={handleDownloadPdf}
          onRevokeLink={handleRevokeShareLink}
          busy={shareBusy}
          message={shareMessage}
          isError={shareMessageError}
        />
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
              Find verified bride and groom profiles with family-guided matching.
            </h1>
            <p className="subtext reveal delay-2">
              Start with trusted profile discovery, shortlist only relevant matches, and unlock full
              details when you are ready. Built for serious families seeking meaningful alliances.
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
            <div className="hero-trust-mini hero-trust-inline reveal delay-4">
              <h4>Why Families Choose Us</h4>
              <ul>
                <li>
                  <strong>Trusted Since 1999</strong>
                  <span>Traditional matchmaking for serious families.</span>
                </li>
                <li>
                  <strong>Verified Member Base</strong>
                  <span>Profiles are screened before they are shown.</span>
                </li>
                <li>
                  <strong>Guided Introductions</strong>
                  <span>Advisor support from shortlist to first call.</span>
                </li>
              </ul>
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
            <article className="notice-card wedding-banner hero-visual-card reveal delay-1">
              <img
                src="/blessed-union.png"
                alt="Sacred wedding blessing"
                loading="lazy"
              />
            </article>
          </div>
        </div>
      </section>

      <section className="home-recent-section" id="profiles">
        <div className="home-recent-shell reveal delay-2">
          <div className="home-recent-head">
            <h3>Recently added verified profiles</h3>
          </div>
          {publicProfilesLoading ? (
            <p className="form-note">Loading profiles...</p>
          ) : publicProfilesError ? (
            <p className="form-message error">{publicProfilesError}</p>
          ) : publicRecentProfiles.length === 0 ? (
            <p className="form-note">No verified profiles available now.</p>
          ) : (
            <div className="home-recent-carousel">
              <div className={`home-recent-track-x ${isPublicFeedRunning ? "is-running" : ""}`}>
                {publicFeedItems.map((profile, index) => (
                <article key={`${profile.profileId}-${index}`} className="home-recent-card">
                  <img
                    src={
                      profile.imageUrl ||
                      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=220&q=80"
                    }
                    alt={`Profile ${profile.profileId}`}
                    loading="lazy"
                  />
                  <div className="home-recent-meta">
                    <div className="home-recent-topline">
                      <p className="home-recent-id">{profile.profileId}</p>
                      <span className="home-recent-age">{profile.age || "-"} yrs</span>
                    </div>
                    <p className="home-recent-main">{profile.profession || "-"}</p>
                    <div className="home-recent-tags">
                      <span>{profile.location || "-"}</span>
                      <span>{profile.gothram || "-"}</span>
                    </div>
                  </div>
                </article>
              ))}
              </div>
            </div>
          )}
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

      <section className="section tint" id="features">
        <div className="section-head">
          <div>
            <p className="eyebrow">Why Choose Us</p>
            <h2>Everything needed for a serious and safe profile search.</h2>
          </div>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Real, Active Matches</h3>
            <p>Discover recently added active profiles with verified information.</p>
          </article>
          <article className="feature-card">
            <h3>Advisor-Assisted Journey</h3>
            <p>Our team helps from first shortlist to family introductions.</p>
          </article>
          <article className="feature-card">
            <h3>Credit-Based Privacy</h3>
            <p>Detailed profile access is controlled and auditable for user safety.</p>
          </article>
          <article className="feature-card">
            <h3>Horoscope & Tradition Focus</h3>
            <p>Essential Vedic fields are included upfront for faster compatibility checks.</p>
          </article>
        </div>
      </section>

      <section className="section" id="about">
        <div className="section-head">
          <div>
            <p className="eyebrow">About Vedic Vivaha</p>
            <h2>A guided, family-first matchmaking process.</h2>
          </div>
        </div>
        <div className="about-grid">
          <article className="card">
            <h3>Our Commitment</h3>
            <p>
              We help families find compatible alliances with dignity, privacy, and careful
              verification at each step.
            </p>
            <ul className="list">
              <li>Traditional preferences respected</li>
              <li>Profile authenticity checks</li>
              <li>Personal support from real advisors</li>
            </ul>
          </article>
          <article className="card">
            <h3>How It Works</h3>
            <p>
              Register once, complete your profile, and browse verified recent matches. Unlock
              full details only for profiles you are truly interested in.
            </p>
            <div className="signature">
              <div className="signature-line"></div>
              <div>
                <p className="signature-name">Simple, Transparent, Effective</p>
                <span>Built for long-term compatibility, not random swiping</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section tint" id="chart">
        <div className="section-head">
          <div>
            <p className="eyebrow">What You Can See</p>
            <h2>Relevant details that help families decide faster.</h2>
          </div>
        </div>
        <div className="chart-grid">
          <div className="chart-card">
            <h3>Basic Profile View</h3>
            <ul className="list">
              <li>Profile ID, age, location, profession</li>
              <li>Core horoscope details for compatibility</li>
              <li>Verified photo availability status</li>
            </ul>
          </div>
          <div className="chart-card">
            <h3>Unlocked Full View</h3>
            <ul className="list">
              <li>Detailed personal and family information</li>
              <li>Contact details and complete profile context</li>
              <li>No repeat credits for already unlocked profiles</li>
            </ul>
          </div>
          <div className="chart-card">
            <h3>Privacy Controls</h3>
            <ul className="list">
              <li>Only active and approved profiles are visible</li>
              <li>Role-based admin controls for updates</li>
              <li>Secure backend API access and session checks</li>
            </ul>
          </div>
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
