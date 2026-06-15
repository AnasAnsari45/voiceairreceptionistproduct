"""
Full Pipecat 1.3.0 voice pipeline for one inbound call leg.

Flow:
  FastAPIWebsocketTransport (Telnyx mulaw ↔ PCM, SileroVAD barge-in)
    → DeepgramSTTService (nova-2-phonecall streaming, 8 kHz linear16)
    → LLMUserAggregator (user turns + VAD)
    → OpenAILLMService (gpt-4o-mini, tool schemas)
    → CartesiaTTSService (8 kHz PCM output)
    → transport.output()
    → LLMAssistantAggregator (assistant turns)
"""
import logging
import os

from dotenv import load_dotenv
from fastapi import WebSocket

from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.frames.frames import TTSSpeakFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import (
    LLMContextAggregatorPair,
    LLMUserAggregatorParams,
)
from pipecat.services.cartesia.tts import CartesiaTTSService
from pipecat.services.deepgram.stt import DeepgramSTTService
from pipecat.services.llm_service import FunctionCallParams
from pipecat.services.openai.llm import OpenAILLMService
from pipecat.transports.websocket.fastapi import (
    FastAPIWebsocketParams,
    FastAPIWebsocketTransport,
)

from config import TenantConfig
from prompts import build_system_prompt
from telnyx_serializer import TelnyxFrameSerializer
from tools import TOOL_DEFINITIONS, execute_tool

load_dotenv()
logger = logging.getLogger(__name__)


async def run_voice_pipeline(
    websocket: WebSocket,
    tenant_config: TenantConfig,
    caller_phone: str,
    call_id: str,
) -> None:
    logger.info(
        "[PIPELINE] start call_id=%s caller=%s tenant=%s",
        call_id, caller_phone, tenant_config.name,
    )

    serializer = TelnyxFrameSerializer()

    transport = FastAPIWebsocketTransport(
        websocket=websocket,
        params=FastAPIWebsocketParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            audio_in_sample_rate=8000,
            audio_out_sample_rate=8000,
            add_wav_header=False,
            serializer=serializer,
        ),
    )

    stt = DeepgramSTTService(
        api_key=os.environ["DEEPGRAM_API_KEY"],
        encoding="linear16",
        sample_rate=8000,
        model="nova-2-phonecall",
        language="en",
        smart_format=True,
        punctuate=True,
        interim_results=True,
        endpointing=200,
    )

    llm = OpenAILLMService(
        api_key=os.environ["OPENAI_API_KEY"],
        model="gpt-4o-mini",
    )

    tts = CartesiaTTSService(
        api_key=os.environ["CARTESIA_API_KEY"],
        voice_id=os.environ["CARTESIA_VOICE_ID"],
        sample_rate=8000,
        encoding="pcm_s16le",
        container="raw",
    )

    # -----------------------------------------------------------------------
    # Context — TOOL_DEFINITIONS is a ToolsSchema (required by 1.3.0)
    # -----------------------------------------------------------------------
    system_prompt = build_system_prompt(tenant_config)
    context = LLMContext(
        messages=[{"role": "system", "content": system_prompt}],
        tools=TOOL_DEFINITIONS,
    )

    aggregators = LLMContextAggregatorPair(
        context,
        user_params=LLMUserAggregatorParams(
            vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.5)),
        ),
    )

    # -----------------------------------------------------------------------
    # Tool call handler (pipecat 1.3.0: single FunctionCallParams arg)
    # -----------------------------------------------------------------------
    async def on_tool_call(params: FunctionCallParams) -> None:
        logger.info("[TOOL] %s args=%s", params.function_name, dict(params.arguments))
        result = await execute_tool(
            name=params.function_name,
            args=dict(params.arguments),
            tenant_id=tenant_config.id,
            call_id=call_id,
        )
        await params.result_callback(result["message"])

    llm.register_function(None, on_tool_call)

    # -----------------------------------------------------------------------
    # Pipeline
    # -----------------------------------------------------------------------
    pipeline = Pipeline([
        transport.input(),
        stt,
        aggregators.user(),
        llm,
        tts,
        transport.output(),
        aggregators.assistant(),
    ])

    task = PipelineTask(
        pipeline,
        params=PipelineParams(allow_interruptions=True),
    )

    # -----------------------------------------------------------------------
    # Greeting — spoken immediately when the WebSocket connection is ready
    # -----------------------------------------------------------------------
    @transport.event_handler("on_client_connected")
    async def on_connected(transport, websocket):
        logger.info("[PIPELINE] client connected — speaking greeting")
        # Add greeting to context so the LLM knows what was said first
        context.add_message({"role": "assistant", "content": tenant_config.greeting})
        # Speak it directly via TTS (bypasses LLM for zero-latency greeting)
        await task.queue_frames([TTSSpeakFrame(tenant_config.greeting)])

    # -----------------------------------------------------------------------
    # Run
    # -----------------------------------------------------------------------
    runner = PipelineRunner()
    await runner.run(task)

    logger.info("[PIPELINE] end call_id=%s", call_id)
