from __future__ import annotations
import logging
from typing import Optional
from .models import db, FeatureFlag
from .schemas import FeatureFlagCreate, FeatureFlagUpdate
from .exceptions import FlagAlreadyExistsError, FlagNotFoundError
from sqlalchemy.exc import IntegrityError

logger = logging.getLogger(__name__)

class FeatureFlagService:
    @staticmethod
    def get_all_flags():
        return FeatureFlag.query.all()

    @staticmethod
    def get_flag_by_id(flag_id: int) -> FeatureFlag:
        flag = db.session.get(FeatureFlag, flag_id)
        if not flag:
            raise FlagNotFoundError()
        return flag

    @staticmethod
    def create_flag(data: FeatureFlagCreate) -> FeatureFlag:
        flag = FeatureFlag(
            name=data.name,
            description=data.description,
            is_enabled=data.is_enabled
        )
        try:
            db.session.add(flag)
            db.session.commit()
            logger.info(f"Created new feature flag: {data.name}")
            return flag
        except IntegrityError:
            db.session.rollback()
            logger.warning(f"Attempted to create duplicate flag: {data.name}")
            raise FlagAlreadyExistsError(data.name)
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating flag: {e}")
            raise

    @staticmethod
    def toggle_flag(flag_id: int, data: FeatureFlagUpdate) -> FeatureFlag:
        flag = FeatureFlagService.get_flag_by_id(flag_id)
            
        old_state = flag.is_enabled
        flag.is_enabled = data.is_enabled
        try:
            db.session.commit()
            logger.info(f"Toggled flag '{flag.name}' from {old_state} to {flag.is_enabled}")
            return flag
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating flag: {e}")
            raise

    @staticmethod
    def delete_flag(flag_id: int) -> None:
        flag = FeatureFlagService.get_flag_by_id(flag_id)
            
        try:
            db.session.delete(flag)
            db.session.commit()
            logger.info(f"Deleted flag '{flag.name}'")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting flag: {e}")
            raise
