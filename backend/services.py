import logging
from typing import Optional, Tuple
from .models import db, FeatureFlag
from .schemas import FeatureFlagCreate, FeatureFlagUpdate
from sqlalchemy.exc import IntegrityError

logger = logging.getLogger(__name__)

class FeatureFlagService:
    @staticmethod
    def get_all_flags():
        return FeatureFlag.query.all()

    @staticmethod
    def get_flag_by_id(flag_id: int) -> Optional[FeatureFlag]:
        return db.session.get(FeatureFlag, flag_id)

    @staticmethod
    def create_flag(data: FeatureFlagCreate) -> Tuple[Optional[FeatureFlag], Optional[str]]:
        flag = FeatureFlag(
            name=data.name,
            description=data.description,
            is_enabled=data.is_enabled
        )
        try:
            db.session.add(flag)
            db.session.commit()
            logger.info(f"Created new feature flag: {data.name}")
            return flag, None
        except IntegrityError:
            db.session.rollback()
            logger.warning(f"Attempted to create duplicate flag: {data.name}")
            return None, "A flag with this name already exists."
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating flag: {e}")
            return None, "An unexpected error occurred."

    @staticmethod
    def toggle_flag(flag_id: int, data: FeatureFlagUpdate) -> Tuple[Optional[FeatureFlag], Optional[str]]:
        flag = FeatureFlagService.get_flag_by_id(flag_id)
        if not flag:
            return None, "Flag not found."
            
        old_state = flag.is_enabled
        flag.is_enabled = data.is_enabled
        try:
            db.session.commit()
            logger.info(f"Toggled flag '{flag.name}' from {old_state} to {flag.is_enabled}")
            return flag, None
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating flag: {e}")
            return None, "An unexpected error occurred."

    @staticmethod
    def delete_flag(flag_id: int) -> bool:
        flag = FeatureFlagService.get_flag_by_id(flag_id)
        if not flag:
            return False
            
        try:
            db.session.delete(flag)
            db.session.commit()
            logger.info(f"Deleted flag '{flag.name}'")
            return True
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting flag: {e}")
            return False
