import pytest
from backend.app import create_app
from backend.models import db

@pytest.fixture
def app():
    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:' # In-memory DB for tests
    })
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_create_flag(client):
    response = client.post('/api/flags', json={
        "name": "new_feature",
        "description": "A test feature flag"
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data["name"] == "new_feature"
    assert data["is_enabled"] is False

def test_create_duplicate_flag(client):
    client.post('/api/flags', json={"name": "duplicate"})
    response = client.post('/api/flags', json={"name": "duplicate"})
    assert response.status_code == 409
    assert "error" in response.get_json()

def test_validation_error(client):
    # Missing required 'name'
    response = client.post('/api/flags', json={"description": "No name flag"})
    assert response.status_code == 400
    assert "messages" in response.get_json()

def test_toggle_flag(client):
    client.post('/api/flags', json={"name": "toggle_me"})
    # Fetch all to get the ID
    all_res = client.get('/api/flags')
    flag_id = all_res.get_json()[0]["id"]
    
    # Toggle it on
    toggle_res = client.patch(f'/api/flags/{flag_id}', json={"is_enabled": True})
    assert toggle_res.status_code == 200
    assert toggle_res.get_json()["is_enabled"] is True

def test_delete_flag(client):
    client.post('/api/flags', json={"name": "delete_me"})
    all_res = client.get('/api/flags')
    flag_id = all_res.get_json()[0]["id"]
    
    delete_res = client.delete(f'/api/flags/{flag_id}')
    assert delete_res.status_code == 204
    
    # Verify it is deleted
    all_res_after = client.get('/api/flags')
    assert len(all_res_after.get_json()) == 0
