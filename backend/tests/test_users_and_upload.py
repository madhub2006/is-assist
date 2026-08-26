import io


def test_reject_non_pdf_file_upload(client, officer_token):
    # Try uploading a .txt file
    fake_txt_file = io.BytesIO(b"Sample plain text content")
    response = client.post(
        "/api/analyses/1/documents",
        files={"file": ("test.txt", fake_txt_file, "text/plain")},
        headers={"Authorization": f"Bearer {officer_token}"}
    )
    assert response.status_code == 400


def test_admin_and_officer_permissions(client, admin_token, officer_token):
    # Admin can access /api/users
    admin_res = client.get("/api/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_res.status_code == 200

    # Officer is forbidden from /api/users
    officer_res = client.get("/api/users", headers={"Authorization": f"Bearer {officer_token}"})
    assert officer_res.status_code == 403
