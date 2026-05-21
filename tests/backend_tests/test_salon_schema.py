from backend.salon import SalonUpdate


def test_salon_update_accepts_partial_data():
    salon = SalonUpdate(phone="123 456 789")

    assert salon.phone == "123 456 789"
    assert salon.name is None


def test_salon_update_model_dump_excludes_unset_fields():
    salon = SalonUpdate(name="Test Salon")

    data = salon.model_dump(exclude_unset=True)

    assert data == {"name": "Test Salon"}


def test_salon_update_accepts_services_list():
    salon = SalonUpdate(services=["Haircut", "Coloring"])

    assert salon.services == ["Haircut", "Coloring"]