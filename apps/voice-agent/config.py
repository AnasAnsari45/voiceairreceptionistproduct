"""
Tenant configuration loader.

Phase 1: returns hardcoded dental config for any inbound number.
Phase 2+: resolves tenant from Neon DB using the dialed phone number.
"""
import os
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class TenantConfig:
    id: str
    name: str
    timezone: str
    hours: str
    location: str
    contact_phone: str
    persona: str
    greeting: str
    faqs: list[dict]
    calcom_event_type_id: Optional[str] = None
    add_caller_as_guest: bool = False
    escalation_email: Optional[str] = None


DENTAL_CONFIG = TenantConfig(
    id="tenant_demo_dental",
    name="Bright Smile Dental",
    timezone="America/New_York",
    hours="Monday through Friday 8 AM to 5 PM, and Saturday 9 AM to 2 PM",
    location="123 Main Street, Springfield",
    contact_phone=os.getenv("TELNYX_PHONE_NUMBER", ""),
    persona="a warm and professional dental receptionist named Sarah",
    greeting="Thank you for calling Bright Smile Dental. This is Sarah speaking. How can I help you today?",
    faqs=[
        {
            "q": "Do you accept insurance?",
            "a": "Yes, we accept Delta Dental, Cigna, Aetna, MetLife, and most major PPO plans. We can verify your benefits before your visit.",
        },
        {
            "q": "How much does a cleaning cost without insurance?",
            "a": "A routine cleaning is $120 without insurance. With insurance it's typically zero to thirty dollars depending on your plan.",
        },
        {
            "q": "Are you accepting new patients?",
            "a": "Yes, we're currently welcoming new patients. I'd be happy to get you scheduled for a new patient exam and cleaning.",
        },
        {
            "q": "What do I do for a dental emergency?",
            "a": "For emergencies during office hours we keep slots open and can usually see you same day. After hours, please call our emergency line at extension nine.",
        },
    ],
    calcom_event_type_id=os.getenv("CALCOM_EVENT_TYPE_ID"),
    escalation_email=os.getenv("ESCALATION_EMAIL"),
)


def get_tenant_by_phone(dialed_number: str) -> TenantConfig:
    """
    Resolve which tenant owns the dialed number.

    Phase 1: always returns the hardcoded dental config.
    Phase 2+: SELECT tenant FROM phone_numbers WHERE e164 = $1, then load full config.
    """
    return DENTAL_CONFIG
