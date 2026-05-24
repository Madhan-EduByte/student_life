"""
DestinAI — Roadmap Endpoint Tests
"""


def test_generate_roadmap(client, test_user_data, test_career_inputs):
    """Test roadmap generation."""
    # Register and login
    client.post("/api/v1/auth/register", json=test_user_data)
    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user_data["email"],
            "password": test_user_data["password"],
        },
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Generate roadmap
    response = client.post(
        "/api/v1/roadmap/generate",
        json={"career_inputs": test_career_inputs},
        headers=headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert "title" in data
    assert "career_path" in data
    assert "milestones" in data
    assert data["is_active"] is True


def test_generate_roadmap_unauthenticated(client, test_career_inputs):
    """Test roadmap generation without auth."""
    response = client.post(
        "/api/v1/roadmap/generate",
        json={"career_inputs": test_career_inputs},
    )
    assert response.status_code == 401


def test_list_roadmaps(client, test_user_data):
    """Test listing user roadmaps."""
    # Register and login
    client.post("/api/v1/auth/register", json=test_user_data)
    login_response = client.post(
        "/api/v1/auth/login",
        data={
            "username": test_user_data["email"],
            "password": test_user_data["password"],
        },
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/v1/roadmap", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "roadmaps" in data
    assert "total" in data
