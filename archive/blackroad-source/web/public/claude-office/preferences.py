"""API routes for user preferences."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import UserPreference

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/preferences", tags=["preferences"])


class PreferenceValue(BaseModel):
    """Request body for setting a preference value."""

    value: str


@router.get("")
async def get_all_preferences(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, str]:
    """Get all user preferences as a dictionary."""
    try:
        result = await db.execute(select(UserPreference))
        preferences = result.scalars().all()
        return {pref.key: pref.value for pref in preferences}
    except Exception as e:
        logger.exception("Error fetching preferences: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/{key}")
async def get_preference(
    key: str, db: Annotated[AsyncSession, Depends(get_db)]
) -> dict[str, str | None]:
    """Get a single preference by key."""
    try:
        result = await db.execute(select(UserPreference).where(UserPreference.key == key))
        pref = result.scalar_one_or_none()
        return {"key": key, "value": pref.value if pref else None}
    except Exception as e:
        logger.exception("Error fetching preference %s: %s", key, e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.put("/{key}")
async def set_preference(
    key: str,
    body: PreferenceValue,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, str]:
    """Set a preference value. Creates or updates the preference."""
    try:
        result = await db.execute(select(UserPreference).where(UserPreference.key == key))
        pref = result.scalar_one_or_none()

        if pref:
            pref.value = body.value
        else:
            pref = UserPreference(key=key, value=body.value)
            db.add(pref)

        await db.commit()
        return {"key": key, "value": body.value}
    except Exception as e:
        await db.rollback()
        logger.exception("Error setting preference %s: %s", key, e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.delete("/{key}")
async def delete_preference(
    key: str, db: Annotated[AsyncSession, Depends(get_db)]
) -> dict[str, str]:
    """Delete a preference by key."""
    try:
        # First check if the preference exists
        check_result = await db.execute(select(UserPreference).where(UserPreference.key == key))
        if check_result.scalar_one_or_none() is None:
            raise HTTPException(status_code=404, detail=f"Preference '{key}' not found")

        await db.execute(delete(UserPreference).where(UserPreference.key == key))
        await db.commit()

        return {"status": "success", "message": f"Preference '{key}' deleted"}
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.exception("Error deleting preference %s: %s", key, e)
        raise HTTPException(status_code=500, detail=str(e)) from e
