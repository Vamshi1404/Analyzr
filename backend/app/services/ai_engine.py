from __future__ import annotations

import json
import os

from groq import Groq

from app.models.schemas import DatasetAnalysis, Insight
from app.services.context_builder import (
    build_analysis_prompt,
    build_enrich_insights_prompt,
    build_proactive_opener_prompt,
)


GROQ_MODEL   = os.getenv("GROQ_MODEL", "mixtral-8x7b-32768")
GROQ_TIMEOUT = int(os.getenv("GROQ_TIMEOUT", "60"))

_client = Groq(api_key=os.getenv("GROQ_API_KEY"), timeout=GROQ_TIMEOUT)


async def _call_groq(prompt: str, max_tokens: int = 1024, temperature: float = 0.4) -> str:
    """Call Groq API (synchronous SDK wrapped for use in async context)."""
    print(f"      [GROQ] Querying {GROQ_MODEL}...")
    try:
        response = _client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"__GROQ_ERROR__: {e}"


def _parse_json(raw: str) -> dict | list | None:
    """Resilient JSON parser for potentially truncated AI responses."""
    # Try to find the first JSON-like block
    for start_char, end_char in [("{", "}"), ("[", "]")]:
        start = raw.find(start_char)
        if start == -1: continue
        
        # Try to find the matching end char
        # If the response is truncated, we might need to "force close" it
        sub = raw[start:]
        try:
            # Try standard parsing first
            end = sub.rfind(end_char) + 1
            if end > 0:
                return json.loads(sub[:end])
        except json.JSONDecodeError:
            # Attempt to fix common truncation issues by adding closing braces
            for fix in [end_char, f'"}}', f'"]', f'}}', f']']:
                try:
                    return json.loads(sub + fix)
                except: continue
    return None


async def enrich_insights_async(
    insights: list[Insight],
    dataset_name: str,
    dataset_shape: tuple[int, int],
) -> list[Insight]:
    """
    Send all insights to the AI in one call and get back AI-written
    business_interpretation for each. Falls back to the original template text
    if the call fails.
    """
    if not insights:
        return insights

    prompt = build_enrich_insights_prompt(insights, dataset_name, dataset_shape)
    raw    = await _call_groq(prompt, max_tokens=2048, temperature=0.5)

    if raw.startswith("__GROQ"):
        return insights  # graceful fallback — keep template text

    parsed = _parse_json(raw)
    if isinstance(parsed, list) and len(parsed) >= len(insights):
        enriched = []
        for i, ins in enumerate(insights):
            new_interp = str(parsed[i]).strip() if i < len(parsed) else ins.business_interpretation
            enriched.append(ins.model_copy(update={"business_interpretation": new_interp}))
        return enriched

    return insights  # fallback


async def interpret_dataset(
    dataset_analysis: DatasetAnalysis,
    charts_summary: list[str],
) -> tuple[str, list[str], list[dict]]:
    """Returns (executive_summary, recommendations_list, core_metrics_list)."""
    prompt = build_analysis_prompt(dataset_analysis, charts_summary)
    raw    = await _call_groq(prompt, max_tokens=2048, temperature=0.3)

    if raw.startswith("__GROQ"):
        return (
            "AI interpretation is temporarily unavailable. Statistical analysis is complete above.",
            ["Check your GROQ_API_KEY environment variable and try again."],
            []
        )

    parsed = _parse_json(raw)
    if isinstance(parsed, dict):
        summary = parsed.get("executive_summary", "")
        recs    = parsed.get("recommendations", [])
        metrics = parsed.get("core_metrics", [])
        return summary, [r for r in recs if r], metrics

    # Fallback: Clean up raw text if JSON keys leak through
    clean = raw.strip()
    if '"executive_summary":' in clean:
        try:
            # Extract content between first and second quote after the key
            parts = clean.split('"executive_summary":')[1].split('"')
            clean = parts[1] if len(parts) > 1 else clean
        except: pass
    
    return clean[:800], [], []


async def get_proactive_opener(session_summary: str) -> str:
    """Generate Leela's unsolicited opening message for the chat bubble."""
    prompt = build_proactive_opener_prompt(session_summary)
    raw    = await _call_groq(prompt, max_tokens=300, temperature=0.6)
    if raw.startswith("__GROQ"):
        return "Hi, I'm Leela — your AI analyst. I've reviewed your dataset and I'm ready to answer any questions you have about the data."
    return raw


async def chat_with_context(prompt: str) -> str:
    """Send a full chat prompt (already built by context_builder) to Groq."""
    raw = await _call_groq(prompt, max_tokens=800, temperature=0.5)
    if raw.startswith("__GROQ_ERROR__"):
        return "Leela is temporarily unavailable. Please check your GROQ_API_KEY and try again."
    return raw
