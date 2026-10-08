import unittest
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException
import httpx

from main import SettingsRequest, StudyRequest, explain_topic, nebius_client, update_settings
from nebius_client import NebiusClient


class StudyExplainTests(unittest.IsolatedAsyncioTestCase):
    async def test_dynamic_programming_prompt_uses_selected_topic_and_subject(self):
        with patch.object(nebius_client, "call_nemotron", new_callable=AsyncMock) as call_model:
            call_model.return_value = {"content": "Dynamic programming answer."}
            result = await explain_topic(StudyRequest(
                topic="What is dynamic programming?",
                depth="beginner",
                subject="Computer Science",
            ))

        self.assertEqual(result["content"], "Dynamic programming answer.")
        model_call = call_model.await_args.kwargs
        self.assertIn("Topic to explain: What is dynamic programming?", model_call["messages"][1]["content"])
        self.assertIn("Subject/Course: Computer Science", model_call["messages"][1]["content"])
        self.assertNotIn("fallback_content", model_call)

    async def test_no_api_response_without_fallback_raises(self):
        client = NebiusClient(api_key="mock_regression_test")
        with self.assertRaises(RuntimeError):
            await client.call_nemotron(tier="nano", messages=[])

    async def test_unavailable_model_returns_service_unavailable(self):
        with patch.object(
            nebius_client,
            "call_nemotron",
            new_callable=AsyncMock,
            side_effect=RuntimeError("No model response"),
        ):
            with self.assertRaises(HTTPException) as raised:
                await explain_topic(StudyRequest(
                    topic="What is dynamic programming?",
                    depth="beginner",
                    subject="Computer Science",
                ))

        self.assertEqual(raised.exception.status_code, 503)

    async def test_settings_validate_key_before_storing_it(self):
        with patch.object(nebius_client, "api_key", "existing-test-key"), patch.object(
            nebius_client,
            "validate_api_key",
            new_callable=AsyncMock,
        ) as validate_key:
            result = await update_settings(SettingsRequest(api_key="valid-test-key"))

            validate_key.assert_awaited_once_with("valid-test-key")
            self.assertEqual(nebius_client.api_key, "valid-test-key")
            self.assertTrue(result["success"])

    async def test_settings_preserve_existing_key_when_nebius_rejects_new_key(self):
        request = httpx.Request("GET", "https://api.tokenfactory.nebius.com/v1/models")
        response = httpx.Response(401, request=request)
        error = httpx.HTTPStatusError("Unauthorized", request=request, response=response)

        with patch.object(nebius_client, "api_key", "existing-test-key"), patch.object(
            nebius_client,
            "validate_api_key",
            new_callable=AsyncMock,
            side_effect=error,
        ):
            with self.assertRaises(HTTPException) as raised:
                await update_settings(SettingsRequest(api_key="invalid-test-key"))

            self.assertEqual(raised.exception.status_code, 401)
            self.assertEqual(raised.exception.detail, "Nebius rejected the API key.")
            self.assertEqual(nebius_client.api_key, "existing-test-key")

    async def test_settings_report_nebius_network_error_without_storing_key(self):
        request = httpx.Request("GET", "https://api.tokenfactory.nebius.com/v1/models")
        error = httpx.ConnectError("Connection failed", request=request)

        with patch.object(nebius_client, "api_key", "existing-test-key"), patch.object(
            nebius_client,
            "validate_api_key",
            new_callable=AsyncMock,
            side_effect=error,
        ):
            with self.assertRaises(HTTPException) as raised:
                await update_settings(SettingsRequest(api_key="new-test-key"))

            self.assertEqual(raised.exception.status_code, 502)
            self.assertEqual(
                raised.exception.detail,
                "Unable to reach Nebius Token Factory to validate the API key.",
            )
            self.assertEqual(nebius_client.api_key, "existing-test-key")

    async def test_settings_keep_mock_simulation_key_behavior(self):
        with patch.object(nebius_client, "api_key", ""), patch.object(
            nebius_client,
            "validate_api_key",
            new_callable=AsyncMock,
        ) as validate_key:
            await update_settings(SettingsRequest(api_key="mock_test_key"))

            validate_key.assert_not_awaited()
            self.assertEqual(nebius_client.api_key, "mock_test_key")


if __name__ == "__main__":
    unittest.main()
