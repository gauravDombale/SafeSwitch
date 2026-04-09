import logging
import json
import uuid
from datetime import datetime, timezone
from flask import Flask, jsonify, request, g, has_request_context
from flask_cors import CORS
from pydantic import ValidationError
from werkzeug.exceptions import HTTPException
from .models import db
from .routes import flag_bp
from .exceptions import DomainError

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "request_id": getattr(g, "request_id", "N/A") if has_request_context() else "SYSTEM"
        }
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def setup_logging():
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    logging.root.handlers = [handler]
    logging.root.setLevel(logging.INFO)

def create_app(test_config=None):
    setup_logging()
    app = Flask(__name__)
    CORS(app)
    
    if test_config is None:
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///flags.db'
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    else:
        app.config.update(test_config)

    db.init_app(app)
    app.register_blueprint(flag_bp, url_prefix='/api')

    @app.before_request
    def assign_req_id():
        g.request_id = request.headers.get("X-Request-Id", str(uuid.uuid4()))

    @app.errorhandler(ValidationError)
    def handle_pydantic_error(e):
        return jsonify({"error": "Validation Error", "messages": e.errors()}), 400

    @app.errorhandler(DomainError)
    def handle_domain_error(e):
        app.logger.warning(f"Domain Rule Triggered: {e.message}")
        return jsonify({"error": e.message}), e.status_code

    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        app.logger.warning(f"HTTP Exception Triggered: {e.code} {e.description}")
        return jsonify({"error": e.name, "message": e.description}), e.code

    @app.errorhandler(Exception)
    def handle_general_exception(e):
        app.logger.error(f"Unhandled Exception: {e}", exc_info=True)
        return jsonify({"error": "Internal Server Error"}), 500

    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(port=8000, debug=True)
