from . import Service

def test_service_name_should_default_to_localhost():
    service = Service()
    assert service.config['host']['name'] == 'localhost'

def test_service_port_should_default_to_3000():
    service = Service()
    assert service.config['host']['port'] == 3000