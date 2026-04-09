from flask import Blueprint, request, jsonify
from werkzeug.exceptions import BadRequest
from .schemas import FeatureFlagCreate, FeatureFlagUpdate
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
    return jsonify([f.to_dict() for f in flags]), 200

@flag_bp.route('/flags', methods=['POST'])
def create_flag():
    data = FeatureFlagCreate(**_get_json_object())
    flag = FeatureFlagService.create_flag(data)
    return jsonify(flag.to_dict()), 201

@flag_bp.route('/flags/<int:flag_id>', methods=['PATCH'])
def toggle_flag(flag_id):
    data = FeatureFlagUpdate(**_get_json_object())
    flag = FeatureFlagService.toggle_flag(flag_id, data)
    return jsonify(flag.to_dict()), 200

@flag_bp.route('/flags/<int:flag_id>', methods=['DELETE'])
def delete_flag(flag_id):
    FeatureFlagService.delete_flag(flag_id)
    return '', 204
