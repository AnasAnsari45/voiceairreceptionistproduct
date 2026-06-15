"""
Pipecat FrameSerializer for Telnyx media streaming protocol.

Telnyx sends audio as JSON envelopes containing base64-encoded μ-law 8 kHz audio.
This serializer converts in both directions so the Pipecat pipeline works with
raw PCM internally.

Inbound  (Telnyx → Pipecat): JSON + base64 mulaw → InputAudioRawFrame (PCM 16-bit, 8 kHz)
Outbound (Pipecat → Telnyx): AudioRawFrame        → JSON + base64 mulaw
"""
import base64
import json
import logging
from typing import Optional

try:
    import audioop
except ImportError:
    import audioop_lts as audioop  # type: ignore  # Python 3.12+ fallback

from pipecat.frames.frames import (
    AudioRawFrame,
    EndFrame,
    Frame,
    InputAudioRawFrame,
    InterruptionFrame,
)
from pipecat.serializers.base_serializer import FrameSerializer

logger = logging.getLogger(__name__)

TELNYX_SAMPLE_RATE = 8000
TELNYX_CHANNELS = 1


class TelnyxFrameSerializer(FrameSerializer):
    """
    Serializer for Telnyx's media-streaming WebSocket protocol.

    Pass an instance to FastAPIWebsocketParams(serializer=...) so the
    FastAPIWebsocketTransport can speak Telnyx's wire format.

    The stream_id is captured lazily from the Telnyx 'start' event, so
    no pre-reading of messages is needed before creating the transport.
    """

    def __init__(self) -> None:
        super().__init__()
        self._stream_id: str = ""

    # ------------------------------------------------------------------
    # Telnyx → Pipecat (inbound from caller)
    # ------------------------------------------------------------------

    async def deserialize(self, data: str | bytes) -> Optional[Frame]:
        """Convert a Telnyx WebSocket text message to a Pipecat frame."""
        try:
            msg = json.loads(data)
        except (json.JSONDecodeError, TypeError, ValueError):
            return None

        event = msg.get("event")

        if event == "start":
            start = msg.get("start", {})
            self._stream_id = start.get("stream_id", "")
            logger.info("[SERIALIZER] stream started id=%s", self._stream_id)
            return None  # control event — no audio frame

        if event == "connected":
            return None  # initial handshake — no audio frame

        if event == "media":
            track = msg.get("media", {}).get("track", "")
            if track != "inbound":
                return None  # ignore our own audio echoed on the outbound track
            payload_b64 = msg["media"].get("payload", "")
            if not payload_b64:
                return None
            mulaw_bytes = base64.b64decode(payload_b64)
            pcm_bytes = audioop.ulaw2lin(mulaw_bytes, 2)  # mulaw → PCM 16-bit
            return InputAudioRawFrame(
                audio=pcm_bytes,
                sample_rate=TELNYX_SAMPLE_RATE,
                num_channels=TELNYX_CHANNELS,
            )

        if event == "stop":
            logger.info("[SERIALIZER] stream stopped")
            return EndFrame()

        return None

    # ------------------------------------------------------------------
    # Pipecat → Telnyx (outbound to caller)
    # ------------------------------------------------------------------

    async def serialize(self, frame: Frame) -> Optional[str | bytes]:
        """Convert a Pipecat frame to a Telnyx WebSocket message."""
        if self.should_ignore_frame(frame):
            return None

        if isinstance(frame, InterruptionFrame):
            # Signal Telnyx to clear its audio buffer (barge-in)
            return json.dumps({"event": "clear"})

        if not isinstance(frame, AudioRawFrame):
            return None

        pcm = frame.audio
        sr = frame.sample_rate
        ch = frame.num_channels

        # Resample if TTS outputs at a sample rate other than 8 kHz
        if sr != TELNYX_SAMPLE_RATE:
            pcm, _ = audioop.ratecv(pcm, 2, ch, sr, TELNYX_SAMPLE_RATE, None)
            ch = 1

        # Mix down to mono if needed
        if ch > 1:
            pcm = audioop.tomono(pcm, 2, 0.5, 0.5)

        mulaw_bytes = audioop.lin2ulaw(pcm, 2)
        payload_b64 = base64.b64encode(mulaw_bytes).decode("utf-8")

        return json.dumps({
            "event": "media",
            "media": {"payload": payload_b64},
        })
