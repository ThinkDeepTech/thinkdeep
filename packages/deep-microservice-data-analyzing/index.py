from .src import Service

schema = {}
service = Service({
    'host': {
        'name': 'localhost',
        'port': 3000
    }
})
service.run([schema])