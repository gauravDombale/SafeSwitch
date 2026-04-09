from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from .schemas import FeatureFlagCreate, FeatureFlagUpdate
from .services import FeatureFlagService

flag_bp = Blueprint('flags', __name__)

@flag_bp.route('/flags', methods=['GET'])
def get_flags():
    flags = FeatureFlagService.get_all_flags()
    return jsonify([f.to_dict() for f in flags]), 200

@flag_bp.route('/flags', methods=['POST'])
def create_flag():
    data = FeatureFlagCreate(**request.get_json())
    flag = FeatureFlagService.create_flag(data)
    return jsonify(flag.to_dict()), 201

@flag_bp.route('/flags/<int:flag_id>', methods=['PATCH'])
def toggle_flag(flag_id):
    data = FeatureFlagUpdate(**request.get_json())
    flag = FeatureFlagService.toggle_flag(flag_id, data)
    return jsonify(flag.to_dict()), 200

@flag_bp.route('/flags/<int:flag_id>', methods=['DELETE'])
def delete_flag(flag_id):
    FeatureFlagService.delete_flag(flag_id)
    return '', 204
