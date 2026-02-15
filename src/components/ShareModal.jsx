const LinkStatus = ({ status }) => {
  const normalized = String(status || "inactive").toLowerCase();
  const label = normalized === "active" ? "Link Active" : normalized === "expired" ? "Link Expired" : "Link Disabled";
  return <span className={`share-status ${normalized}`}>{label}</span>;
};

const ShareModal = ({
  open,
  onClose,
  shareUrl,
  shareStatus,
  expiresAt,
  includeContactDetails,
  onToggleIncludeContactDetails,
  expiresInDays,
  onChangeExpiresInDays,
  onGenerateLink,
  onCopyLink,
  onShareWhatsApp,
  onShareEmail,
  onDownloadPdf,
  onRevokeLink,
  busy,
  message,
  isError
}) => {
  if (!open) return null;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" role="dialog" aria-modal="true" aria-label="Share Profile" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3>Share Profile</h3>
          <button type="button" className="share-close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="form-note">
          Create a secure, read-only profile link for family, relatives, or matchmakers.
        </p>

        <div className="share-controls-grid">
          <label>
            <span>Link Expiration</span>
            <select value={expiresInDays} onChange={(event) => onChangeExpiresInDays(Number(event.target.value))}>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
          </label>
          <label className="share-check">
            <input
              type="checkbox"
              checked={includeContactDetails}
              onChange={(event) => onToggleIncludeContactDetails(event.target.checked)}
            />
            <span>Allow contact details in shared profile</span>
          </label>
        </div>

        <div className="share-link-row">
          <input type="text" value={shareUrl || "Generate secure link to start sharing"} readOnly />
          <button type="button" className="btn ghost" onClick={onGenerateLink} disabled={busy}>
            {busy ? "Generating..." : "Generate Link"}
          </button>
        </div>

        <div className="share-meta">
          <p>
            Status: <LinkStatus status={shareStatus} />
          </p>
          {expiresAt && (
            <p>
              Expires on: <strong>{new Date(expiresAt).toLocaleString()}</strong>
            </p>
          )}
        </div>

        {message && <p className={`form-message ${isError ? "error" : "success"}`}>{message}</p>}

        <div className="share-action-grid">
          <button type="button" className="btn ghost" onClick={onCopyLink} disabled={busy}>
            Copy Shareable Link
          </button>
          <button type="button" className="btn ghost" onClick={onShareWhatsApp} disabled={busy}>
            Share via WhatsApp
          </button>
          <button type="button" className="btn ghost" onClick={onShareEmail} disabled={busy}>
            Share via Email
          </button>
          <button type="button" className="btn ghost" onClick={onDownloadPdf} disabled={busy}>
            Download PDF
          </button>
        </div>

        <div className="share-footer-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={onRevokeLink}
            disabled={busy || !shareUrl || String(shareStatus).toLowerCase() !== "active"}
          >
            Disable Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
