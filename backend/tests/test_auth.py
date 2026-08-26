def test_login_success(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "testadmin@isassist.gov.in", "password": "TestPass@123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "Admin"
    assert data["email"] == "testadmin@isassist.gov.in"


def test_login_invalid_password(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "testadmin@isassist.gov.in", "password": "WrongPassword"}
    )
    assert response.status_code == 401


def test_get_me(client, admin_token):
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testadmin@isassist.gov.in"
