def test_create_and_evaluate_analysis(client, officer_token):
    payload = {
        "title": "Procurement of LED Street Lights",
        "product_name": "LED Street Light",
        "category": "Electrical",
        "procurement_type": "Goods",
        "quantity": "500 Nos",
        "application_use": "Highway lighting",
        "natural_language_input": "Procuring 500 units of 100W LED street lights with IP66 protection.",
        "run_mock_analysis": True
    }

    response = client.post(
        "/api/analyses",
        json=payload,
        headers={"Authorization": f"Bearer {officer_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["product_name"] == "LED Street Light"
    assert data["is_mock"] is True
    assert data["readiness_score"] > 0
    analysis_id = data["id"]

    # Get analysis detail
    detail_res = client.get(
        f"/api/analyses/{analysis_id}",
        headers={"Authorization": f"Bearer {officer_token}"}
    )
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert len(detail["requirements"]) > 0
    assert len(detail["recommendations"]) > 0
    assert len(detail["findings"]) > 0


def test_list_analyses(client, officer_token):
    response = client.get(
        "/api/analyses",
        headers={"Authorization": f"Bearer {officer_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
