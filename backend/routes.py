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
    try:
        data = FeatureFlagCreate(**request.get_json())
    except ValidationError as e:
        return jsonify({"error": "Validation Error", "messages": e.errors()}), 400

    flag, error = FeatureFlagService.create_flag(data)
    if error:
        return jsonify({"error": error}), 409
        
    return jsonify(flag.to_dict()), 201

@flag_bp.route('/flags/<int:flag_id>', methods=['PATCH'])
def toggle_flag(flag_id):
    try:
        data = FeatureFlagUpdate(**request.get_json())
    except ValidationError as e:
        return jsonify({"error": "Validation Error", "messages": e.errors()}), 400

    flag, error = FeatureFlagService.toggle_flag(flag_id, data)
    if error:
        # Simple distinction between not found and internal errors
        code = 404 if "not found" in error else 500
        return jsonify({"error": error}), code
        
    return jsonify(flag.to_dict()), 200

@flag_bp.route('/flags/<int:flag_id>', methods=['DELETE'])
def delete_flag(flag_id):
    success = FeatureFlagService.delete_flag(flag_id)
    if not success:
        return jsonify({"error": "Flag not found or could not be deleted"}), 404
        
    return '', 204
