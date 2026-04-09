import logging
from flask import Flask, jsonify
from flask_cors import CORS
from pydantic import ValidationError
from .models import db
from .routes import flag_bp

def create_app(test_config=None):
    app = Flask(__name__)
    CORS(app)  # Enable CORS for the React frontend
    
    if test_config is None:
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///flags.db'
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    else:
        app.config.update(test_config)

    # Initialize extensions
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(flag_bp, url_prefix='/api')

    # Setup Logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    # Global Error Handlers for interface safety
    @app.errorhandler(ValidationError)
    def handle_pydantic_error(e):
        return jsonify({"error": "Validation Error", "messages": e.errors()}), 400

    @app.errorhandler(Exception)
    def handle_general_exception(e):
        app.logger.error(f"Unhandled Exception: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(port=8000, debug=True)
