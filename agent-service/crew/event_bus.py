import asyncio
from typing import AsyncGenerator, Dict, Any, Union
from pydantic import BaseModel

_END_SENTINEL = object()

class EventBus:
    """
    Per-request asyncio.Queue-backed event bus.
    Guarantees request isolation so no cross-request or cross-user event leakage occurs.
    """
    def __init__(self):
        self._queue: asyncio.Queue = asyncio.Queue()
        self._closed: bool = False

    async def push(self, event: Union[Dict[str, Any], BaseModel]) -> None:
        if self._closed:
            return
        if isinstance(event, BaseModel):
            data = event.model_dump()
        else:
            data = event
        await self._queue.put(data)

    async def push_end(self) -> None:
        if not self._closed:
            self._closed = True
            await self._queue.put(_END_SENTINEL)

    async def stream(self) -> AsyncGenerator[Dict[str, Any], None]:
        while True:
            item = await self._queue.get()
            if item is _END_SENTINEL:
                self._queue.task_done()
                break
            try:
                yield item
            finally:
                self._queue.task_done()
