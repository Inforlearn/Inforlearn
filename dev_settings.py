# This is an example local_settings.py that will get the server to
# play nice with the local development server. You'll want to rename it
# local_settings.py before running ./bin/testserver.sh

DEBUG = True
TEMPLATE_DEBUG = True

GAE_DOMAIN = 'localhost:8080'
DOMAIN = 'localhost:8080'
COOKIE_DOMAIN = 'localhost'
SUBDOMAINS_ENABLED = False
SSL_LOGIN_ENABLED = False

