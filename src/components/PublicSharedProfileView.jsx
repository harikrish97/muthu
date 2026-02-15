import { useEffect, useState } from "react";

import { apiFetch } from "../lib/api";

const PublicSharedProfileView = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSharedProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch(`/profile/share/${encodeURIComponent(token)}`);
        if (!cancelled) setPayload(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load shared profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSharedProfile();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="shared-profile-page">
        <main className="shared-profile-shell">
          <p className="form-note">Loading shared profile...</p>
        </main>
      </div>
    );
  }

  if (error || !payload?.profile) {
    return (
      <div className="shared-profile-page">
        <main className="shared-profile-shell">
          <h1>Shared Profile</h1>
          <p className="form-message error" style={{ marginTop: "12px" }}>
            {error || "Shared profile unavailable"}
          </p>
          <a className="btn ghost" href="/" style={{ marginTop: "14px", width: "fit-content" }}>
            Back to Home
          </a>
        </main>
      </div>
    );
  }

  const { profile } = payload;
  const profileRows = [
    ["Name", profile.name],
    ["Gender", profile.gender],
    ["Date of Birth", profile.dob],
    ["Age", profile.age ? `${profile.age} yrs` : "-"],
    ["Location", profile.location],
    ["Education", profile.education],
    ["Occupation", profile.occupation],
    ["Gothram", profile.gothram],
    ["Nakshatra", profile.nakshatra],
    ["Sect / Subsect", [profile.sect, profile.subsect].filter(Boolean).join(" / ")]
  ];

  return (
    <div className="shared-profile-page">
      <main className="shared-profile-shell">
        <div className="shared-profile-head">
          <div>
            <p className="eyebrow">Read-Only Shared Profile</p>
            <h1>{profile.name}</h1>
            <p className="form-note">This link is secure and time-limited.</p>
          </div>
          <span className={`share-status ${payload.linkStatus || "inactive"}`}>
            {payload.linkStatus === "active" ? "Link Active" : "Link Expired"}
          </span>
        </div>

        {profile.imageUrl && (
          <img src={profile.imageUrl} alt={`${profile.name} profile`} className="shared-profile-image" />
        )}

        <div className="shared-profile-grid">
          {profileRows.map(([label, value]) => (
            <article className="shared-profile-item" key={label}>
              <span>{label}</span>
              <p>{value || "-"}</p>
            </article>
          ))}
        </div>

        {profile.about && (
          <section className="shared-profile-panel">
            <h3>About</h3>
            <p>{profile.about}</p>
          </section>
        )}

        {profile.familyDetails && (
          <section className="shared-profile-panel">
            <h3>Family Details</h3>
            <p>{profile.familyDetails}</p>
          </section>
        )}

        {profile.contact && (
          <section className="shared-profile-panel">
            <h3>Contact Information</h3>
            <div className="shared-contact-grid">
              {profile.contact.phone && (
                <p>
                  <strong>Phone:</strong> {profile.contact.phone}
                </p>
              )}
              {profile.contact.whatsappNumber && (
                <p>
                  <strong>WhatsApp:</strong> {profile.contact.whatsappNumber}
                </p>
              )}
              {profile.contact.alternateContactNumber && (
                <p>
                  <strong>Alternate:</strong> {profile.contact.alternateContactNumber}
                </p>
              )}
              {profile.contact.email && (
                <p>
                  <strong>Email:</strong> {profile.contact.email}
                </p>
              )}
              {profile.contact.primaryContactName && (
                <p>
                  <strong>Primary Contact:</strong> {profile.contact.primaryContactName}
                </p>
              )}
              {profile.contact.primaryContactRelation && (
                <p>
                  <strong>Relation:</strong> {profile.contact.primaryContactRelation}
                </p>
              )}
            </div>
          </section>
        )}

        <p className="form-note">
          Link expires on {payload.expiresAt ? new Date(payload.expiresAt).toLocaleString() : "-"}
        </p>
        <a className="btn ghost" href="/" style={{ width: "fit-content" }}>
          Back to Home
        </a>
      </main>
    </div>
  );
};

export default PublicSharedProfileView;
