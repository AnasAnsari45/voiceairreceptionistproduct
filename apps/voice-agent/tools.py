"""
Receptionist tool definitions + dispatcher.

TOOL_DEFINITIONS  — ToolsSchema (pipecat 1.3.0) passed to LLMContext.
execute_tool()    — dispatches a tool call by name and returns a spoken response.

Phase 1: all tools log the captured data and return a canned spoken confirmation.
Phase 2+: wire capture_lead → Neon DB, book/reschedule/cancel → Cal.com + Resend email.
"""
import json
import logging
from typing import Any

from pipecat.adapters.schemas.function_schema import FunctionSchema
from pipecat.adapters.schemas.tools_schema import ToolsSchema

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Tool schemas (pipecat 1.3.0 — LLMContext requires ToolsSchema, not raw dicts)
# ---------------------------------------------------------------------------

TOOL_DEFINITIONS = ToolsSchema(
    standard_tools=[
        FunctionSchema(
            name="capture_lead",
            description=(
                "Save the caller's contact information and reason for calling. "
                "Call this once you have the caller's name and the reason for their call. "
                "Do not wait until the end of the call."
            ),
            properties={
                "name":   {"type": "string", "description": "Caller's full name"},
                "phone":  {"type": "string", "description": "Caller's phone number"},
                "reason": {"type": "string", "description": "Why the caller is contacting us"},
                "email":  {"type": "string", "description": "Caller's email address (if provided)"},
            },
            required=["name", "phone", "reason"],
        ),
        FunctionSchema(
            name="book_appointment",
            description=(
                "Book an appointment for the caller. "
                "Confirm the date, time, and type of appointment before calling this."
            ),
            properties={
                "caller_name":        {"type": "string", "description": "Caller's name"},
                "caller_phone":       {"type": "string", "description": "Caller's phone number"},
                "appointment_type":   {"type": "string", "description": "Type of appointment (e.g. cleaning, new patient exam)"},
                "preferred_date":     {"type": "string", "description": "Requested date (e.g. Monday June 16)"},
                "preferred_time":     {"type": "string", "description": "Requested time (e.g. 10 AM)"},
                "caller_email":       {"type": "string", "description": "Caller's email (optional, for calendar invite)"},
            },
            required=["caller_name", "caller_phone", "appointment_type", "preferred_date", "preferred_time"],
        ),
        FunctionSchema(
            name="reschedule_appointment",
            description="Reschedule an existing appointment to a new date and time.",
            properties={
                "caller_name":  {"type": "string", "description": "Caller's name"},
                "caller_phone": {"type": "string", "description": "Caller's phone number"},
                "new_date":     {"type": "string", "description": "New preferred date"},
                "new_time":     {"type": "string", "description": "New preferred time"},
            },
            required=["caller_name", "caller_phone", "new_date", "new_time"],
        ),
        FunctionSchema(
            name="cancel_appointment",
            description="Cancel the caller's existing appointment.",
            properties={
                "caller_name":  {"type": "string", "description": "Caller's name"},
                "caller_phone": {"type": "string", "description": "Caller's phone number"},
                "reason":       {"type": "string", "description": "Reason for cancellation (optional)"},
            },
            required=["caller_name", "caller_phone"],
        ),
        FunctionSchema(
            name="escalate",
            description=(
                "Take a message and notify the office when you cannot resolve the caller's "
                "request. Use for complex issues, complaints, or anything outside your knowledge."
            ),
            properties={
                "caller_name":  {"type": "string", "description": "Caller's name"},
                "caller_phone": {"type": "string", "description": "Caller's phone number"},
                "reason":       {"type": "string", "description": "Detailed description of the issue"},
                "urgency":      {"type": "string", "enum": ["low", "normal", "urgent"], "description": "How urgent the matter is"},
            },
            required=["caller_name", "caller_phone", "reason"],
        ),
    ]
)


# ---------------------------------------------------------------------------
# Dispatcher
# ---------------------------------------------------------------------------

async def execute_tool(name: str, args: dict, tenant_id: str, call_id: str) -> dict:
    """Route a tool call to the appropriate handler."""
    logger.info("[TOOL] %s tenant=%s call=%s args=%s", name, tenant_id, call_id, json.dumps(args))

    if name == "capture_lead":
        return await _capture_lead(args, tenant_id, call_id)
    if name == "book_appointment":
        return await _book_appointment(args, tenant_id, call_id)
    if name == "reschedule_appointment":
        return await _reschedule_appointment(args, tenant_id, call_id)
    if name == "cancel_appointment":
        return await _cancel_appointment(args, tenant_id, call_id)
    if name == "escalate":
        return await _escalate(args, tenant_id, call_id)

    logger.warning("[TOOL] unknown tool: %s", name)
    return {"success": False, "message": "I'm sorry, I wasn't able to complete that action."}


# ---------------------------------------------------------------------------
# Handlers (Phase 1: log + spoken confirmation only)
# ---------------------------------------------------------------------------

async def _capture_lead(args: dict, tenant_id: str, call_id: str) -> dict:
    logger.info("[LEAD] %s", json.dumps({**args, "tenant_id": tenant_id, "call_id": call_id}))
    return {"success": True, "message": "Got it, I've noted your information."}


async def _book_appointment(args: dict, tenant_id: str, call_id: str) -> dict:
    date = args.get("preferred_date", "the requested date")
    time = args.get("preferred_time", "the requested time")
    logger.info("[APPT:BOOK] %s", json.dumps({**args, "tenant_id": tenant_id, "call_id": call_id}))
    return {
        "success": True,
        "message": (
            f"I've requested an appointment for {date} at {time}. "
            "The office will send a confirmation — is there anything else I can help you with?"
        ),
    }


async def _reschedule_appointment(args: dict, tenant_id: str, call_id: str) -> dict:
    date = args.get("new_date", "the new date")
    time = args.get("new_time", "the new time")
    logger.info("[APPT:RESCHEDULE] %s", json.dumps({**args, "tenant_id": tenant_id, "call_id": call_id}))
    return {
        "success": True,
        "message": (
            f"I've noted your reschedule request for {date} at {time}. "
            "The office will confirm the change shortly."
        ),
    }


async def _cancel_appointment(args: dict, tenant_id: str, call_id: str) -> dict:
    logger.info("[APPT:CANCEL] %s", json.dumps({**args, "tenant_id": tenant_id, "call_id": call_id}))
    return {
        "success": True,
        "message": "I've noted your cancellation request. The office will follow up to confirm.",
    }


async def _escalate(args: dict, tenant_id: str, call_id: str) -> dict:
    logger.info("[ESCALATE] %s", json.dumps({**args, "tenant_id": tenant_id, "call_id": call_id}))
    return {
        "success": True,
        "message": (
            "I've taken a note of your situation and will make sure someone from the team "
            "reaches out to you as soon as possible. Is there anything else I can help with?"
        ),
    }
