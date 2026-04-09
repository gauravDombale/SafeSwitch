from flask import Blueprint, request, jsonify
from werkzeug.exceptions import BadRequest
from .schemas import FeatureFlagCreate, FeatureFlagUpdate, FeatureFlagResponse
from .services import FeatureFlagService

flag_bp = Blueprint('flags', __name__)


def _get_json_object():
    payload = request.get_json()
    if payload is None:
        raise BadRequest("Request body must be valid JSON.")
    if not isinstance(payload, dict):
        raise BadRequest("JSON body must be an object.")
    return payload

@flag_bp.route('/flags', methods=['GET'])
def get_flags():
    flags = FeatureFlagService.get_all_flags()
    return jsonify([FeatureFlagResponse.model_validate(f).model_dump() for f in flags]), 200

@flag_bp.route('/flags', methods=['POST'])
def create_flag():
    data = FeatureFlagCreate(**_get_json_object())
    flag = FeatureFlagService.create_flag(data)
    return jsonify(FeatureFlagResponse.model_validate(flag).model_dump()), 201

@flag_bp.route('/flags/<int:flag_id>', methods=['PATCH'])
def toggle_flag(flag_id):
    data = FeatureFlagUpdate(**_get_json_object())
    flag = FeatureFlagService.toggle_flag(flag_id, data)
    return jsonify(FeatureFlagResponse.model_validate(flag).model_dump()), 200

@flag_bp.route('/flags/<int:flag_id>', methods=['DELETE'])
def delete_flag(flag_id):
    FeatureFlagService.delete_flag(flag_id)
    return '', 204
