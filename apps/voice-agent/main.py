"""
VAI Voice Agent — FastAPI entry point.

Endpoints:
  GET  /health              — Render health check
  POST /telnyx/webhook      — Telnyx Call Control events
  GET  /ws/{call_id}        — Telnyx media streaming WebSocket
"""
import logging
import os
import urllib.parse
import uuid

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse

from agent import run_voice_pipeline
from config import get_tenant_by_phone

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

TELNYX_API_KEY = os.environ["TELNYX_API_KEY"]
TELNYX_BASE = "https://api.telnyx.com/v2"
VOICE_AGENT_PUBLIC_URL = os.environ["VOICE_AGENT_PUBLIC_URL"].rstrip("/")

app = FastAPI(title="VAI Voice Agent")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _telnyx(method: str, path: str, **kwargs) -> dict:
    """Thin async wrapper for the Telnyx REST API."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.request(
            method,
            f"{TELNYX_BASE}{path}",
            headers={
                "Authorization": f"Bearer {TELNYX_API_KEY}",
                "Content-Type": "application/json",
            },
            **kwargs,
        )
        resp.raise_for_status()
        return resp.json()


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Telnyx webhook
# ---------------------------------------------------------------------------

@app.post("/telnyx/webhook")
async def telnyx_webhook(request: Request):
    """
    Telnyx Call Control webhook.

    call.initiated  → answer the call + start media streaming.
    call.hangup     → log and clean up.
    """
    body = await request.json()
    event_type: str = body.get("data", {}).get("event_type", "")
    payload: dict = body.get("data", {}).get("payload", {})

    logger.info("[WEBHOOK] event=%s", event_type)

    if event_type == "call.initiated":
        call_control_id: str = payload["call_control_id"]
        to_number: str = payload.get("to", "")      # our number — resolves the tenant
        from_number: str = payload.get("from", "")  # caller
        call_id = str(uuid.uuid4())

        logger.info(
            "[CALL] inbound call_id=%s from=%s to=%s",
            call_id, from_number, to_number,
        )

        try:
            # 1. Answer the call
            await _telnyx("POST", f"/calls/{call_control_id}/actions/answer")

            # 2. Stream media to our WebSocket, passing the dialed number as a
            #    query param so the WS handler can resolve the correct tenant.
            stream_url = (
                f"{VOICE_AGENT_PUBLIC_URL}/ws/{call_id}"
                f"?to={urllib.parse.quote(to_number)}"
            )
            await _telnyx(
                "POST",
                f"/calls/{call_control_id}/actions/streaming_start",
                json={"stream_url": stream_url, "stream_track": "both_tracks"},
            )
            logger.info("[CALL] answered — streaming to %s", stream_url)

        except Exception as exc:
            logger.error("[CALL] failed to answer cc=%s: %s", call_control_id, exc)

    elif event_type == "call.hangup":
        logger.info("[CALL] hangup cc=%s", payload.get("call_control_id"))

    elif event_type == "streaming.started":
        logger.info("[STREAM] started sid=%s", payload.get("stream_id"))

    elif event_type == "streaming.stopped":
        logger.info("[STREAM] stopped sid=%s", payload.get("stream_id"))

    return JSONResponse({"status": "ok"})


# ---------------------------------------------------------------------------
# WebSocket — Telnyx media streaming
# ---------------------------------------------------------------------------

@app.websocket("/ws/{call_id}")
async def ws_media(websocket: WebSocket, call_id: str, to: str = ""):
    """
    Telnyx connects here after streaming_start.

    The `to` query param (the dialed number) is used to resolve the tenant.
    FastAPIWebsocketTransport accepts the connection and handles all Telnyx
    protocol framing through TelnyxFrameSerializer.
    """
    logger.info("[WS] incoming call_id=%s to=%s", call_id, to)
    tenant_config = get_tenant_by_phone(to)

    try:
        await run_voice_pipeline(
            websocket=websocket,
            tenant_config=tenant_config,
            caller_phone="unknown",   # extracted from Telnyx start event in Phase 2+
            call_id=call_id,
        )
    except WebSocketDisconnect:
        logger.info("[WS] disconnected call_id=%s", call_id)
    except Exception as exc:
        logger.error("[WS] error call_id=%s: %s", call_id, exc, exc_info=True)
    finally:
        logger.info("[WS] closed call_id=%s", call_id)
