from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PolicyDecision:
    approval_required: bool
    blocked_reasons: list[str]


APPROVAL_GATES: dict[str, tuple[str, ...]] = {
    "pricing": ("price", "pricing", "membership", "\u00a3", "gbp"),
    "legal": ("privacy", "terms", "legal"),
    "payments": ("payment", "checkout", "stripe"),
    "medical_claims": ("guarantee", "injury", "safe", "medical"),
    "delete_page": ("delete", "remove page"),
    "new_integrations": ("new booking system", "integration"),
    "brand_identity_change": ("logo", "brand identity", "rebrand", "new colours", "new colors"),
}


def find_approval_gates(
    text: str,
    request_type: str | None = None,
    page_type: str | None = None,
) -> list[str]:
    lower = text.casefold()
    gates: list[str] = []

    for gate, keywords in APPROVAL_GATES.items():
        if any(keyword in lower for keyword in keywords):
            if gate == "legal" and request_type == "predefined_page_addition" and page_type in {"privacy", "terms"}:
                continue
            gates.append(gate)

    return gates


def evaluate_policy(
    text: str,
    request_type: str | None = None,
    page_type: str | None = None,
) -> PolicyDecision:
    gates = find_approval_gates(text, request_type=request_type, page_type=page_type)
    blocked_reasons = [f"{gate} changes require manual approval" for gate in gates]
    return PolicyDecision(approval_required=bool(gates), blocked_reasons=blocked_reasons)


def unsupported_reply() -> str:
    return (
        "I can help, but this falls outside the approved update menu for this site. "
        "I'll flag it for manual review."
    )
