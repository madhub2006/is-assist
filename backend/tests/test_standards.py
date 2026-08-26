def test_list_and_search_standards(client):
    response = client.get("/api/standards?query=10322")
    assert response.status_code == 200
    stds = response.json()
    assert len(stds) > 0
    assert "DEMO-IS-10322" in stds[0]["is_number"]


def test_get_standard_detail(client):
    # First get list to find id
    response = client.get("/api/standards")
    stds = response.json()
    assert len(stds) > 0
    std_id = stds[0]["id"]

    detail_res = client.get(f"/api/standards/{std_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == std_id
