from collections.abc import AsyncGenerator

from groq import AsyncGroq

MODEL = "llama-3.1-8b-instant"


async def stream_completion(
    groq_key: str,
    messages: list[dict],
) -> AsyncGenerator[str, None]:
    """
    Stream a chat completion from Groq.
    Yields text delta strings as they arrive.
    The key is used ephemerally and never stored.
    """
    client = AsyncGroq(api_key=groq_key)
    stream = await client.chat.completions.create(
        model=MODEL,
        messages=messages,
        stream=True,
        temperature=0.2,
        max_tokens=1024,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
