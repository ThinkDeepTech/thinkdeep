class Service(object):
    """Generic service core for python services"""
    def __init__(self, config = None):
        self.configure(config)

    # TODO Take care of non-happy path cases with error/exception
    # handling
    def run(self, schemas = None):
        if self.valid_configuration():
            pass

    def configure(self, options = None):
        if not options:
            options = {
                'host': {
                    'name': 'localhost',
                    'port': 3000
                }
            }
        self.config = options

    def valid_configuration(self):
        pass