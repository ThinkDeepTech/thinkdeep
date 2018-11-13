from . import Service

def test_service_name_should_default_to_localhost():
    service = Service()
    assert service.config['host']['name'] == 'localhost'

def test_service_port_should_default_to_3000():
    service = Service()
    assert service.config['host']['port'] == 3000

def test_service_should_allow_user_to_set_host_name():
    service = Service({
        'host': {
            'name': 'different'
        }
    })
    assert service.config['host']['name'] == 'differents'

def test_service_should_allow_user_to_set_host_port():
    service = Service({
        'host': {
            'port': 1234
        }
    })
    assert service.config['host']['port'] == 1234
