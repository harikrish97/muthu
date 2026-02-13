import base64
import hashlib
import hmac
import json
from typing import Optional


def create_member_token(member_id: str, secret: str) -> str:
    payload = {"member_id": member_id}
    payload_json = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    payload_b64 = base64.urlsafe_b64encode(payload_json).decode("utf-8").rstrip("=")
    signature = hmac.new(secret.encode("utf-8"), payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{signature}"


def extract_member_id_from_token(token: str, secret: str) -> Optional[str]:
    try:
        payload_b64, signature = token.split(".", 1)
    except ValueError:
        return None

    expected_signature = hmac.new(
        secret.encode("utf-8"),
        payload_b64.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(signature, expected_signature):
        return None

    padded = payload_b64 + "=" * (-len(payload_b64) % 4)
    try:
        payload_bytes = base64.urlsafe_b64decode(padded.encode("utf-8"))
        payload = json.loads(payload_bytes.decode("utf-8"))
    except Exception:
        return None

    member_id = payload.get("member_id")
    if not isinstance(member_id, str) or not member_id:
        return None
    return member_id
