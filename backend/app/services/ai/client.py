"""Provider-agnostic HTTP client for AI inference via standard OpenAI-compatible API."""

import json
import logging
from typing import Any, Optional

import httpx

from app.core.config import settings
from app.core.errors import AINotConfiguredError, AIProviderError

logger = logging.getLogger("app.ai.client")


class AIClient:
    """Provider-agnostic client connecting to any OpenAI-compatible completions endpoint."""

    @classmethod
    def check_configuration(cls) -> None:
        """Verify that an API key is configured; raise AINotConfiguredError if missing."""
        if not settings.is_ai_configured:
            raise AINotConfiguredError(
                "AI features are not configured yet. Add your API_KEY to the backend .env file to enable document intelligence."
            )

    @classmethod
    async def chat_completion(
        cls,
        messages: list[dict[str, str]],
        temperature: float = 0.2,
        json_mode: bool = False,
    ) -> str:
        """Send chat completion request to configured OpenAI-compatible endpoint."""
        cls.check_configuration()

        base_url = settings.get_ai_base_url().rstrip("/")
        url = f"{base_url}/chat/completions"


        headers = {
            "Authorization": f"Bearer {settings.get_api_key()}",
            "Content-Type": "application/json",
        }

        payload: dict[str, Any] = {
            "model": settings.get_ai_model(),
            "messages": messages,
            "temperature": temperature,
        }


        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        timeout = httpx.Timeout(settings.ai_timeout_seconds, connect=15.0)

        async with httpx.AsyncClient(timeout=timeout) as client:
            try:
                response = await client.post(url, json=payload, headers=headers)
            except httpx.TimeoutException as exc:
                logger.error("AI provider timed out: %s", exc)
                raise AIProviderError("The AI request timed out. Please try again or use a shorter document.") from exc
            except httpx.ConnectError as exc:
                logger.error("AI provider connection error: %s", exc)
                raise AIProviderError("Could not connect to the AI provider. Please check network connectivity and AI_BASE_URL.") from exc
            except Exception as exc:
                logger.error("AI provider network exception: %s", exc)
                raise AIProviderError(f"AI provider communication failed: {exc}") from exc

            # If json_mode was rejected by a provider not supporting response_format, retry without it
            if response.status_code == 400 and json_mode and "response_format" in response.text:
                logger.info("Retrying chat completion without response_format...")
                payload.pop("response_format", None)
                try:
                    response = await client.post(url, json=payload, headers=headers)
                except Exception as exc:
                    raise AIProviderError(f"AI retry failed: {exc}") from exc

            if response.status_code == 401 or response.status_code == 403:
                logger.error("AI authentication failed (%s): %s", response.status_code, response.text)
                raise AIProviderError("Authentication failed with the AI provider. Please check the API_KEY in backend .env.")
            elif response.status_code == 429:
                logger.error("AI rate limit/quota reached: %s", response.text)
                try:
                    err_json = response.json()
                    err_msg = err_json.get("error", {}).get("message")
                except Exception:
                    err_msg = None
                if err_msg and ("credit" in err_msg.lower() or "quota" in err_msg.lower() or "billing" in err_msg.lower()):
                    raise AIProviderError(f"AI Provider Quota Reached: {err_msg}")
                raise AIProviderError(f"AI rate limit reached: {err_msg or 'Please wait a moment before asking again.'}")
            elif response.status_code >= 500:
                logger.error("AI server error (%s): %s", response.status_code, response.text)
                raise AIProviderError("The AI provider service encountered an error. Please try again later.")
            elif response.status_code >= 400:
                logger.error("AI client error (%s): %s", response.status_code, response.text)
                try:
                    err_json = response.json()
                    err_msg = err_json.get("error", {}).get("message") or response.text
                except Exception:
                    err_msg = response.text
                raise AIProviderError(f"AI provider rejected request: {err_msg}")


            try:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                return content.strip()
            except (KeyError, IndexError, json.JSONDecodeError) as exc:
                logger.error("Failed to parse AI provider response: %s (raw: %s)", exc, response.text)
                raise AIProviderError("Received an invalid response format from the AI provider.") from exc
