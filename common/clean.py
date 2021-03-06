#! coding: utf-8
import re
import urlparse

from django.conf import settings

from cleanliness import cleaner
from cleanliness import encoding

from common import exception
from common import display

# these refer to the lengths of the nick before the @ symbol
NICK_MIN_LENGTH = 2
NICK_MAX_LENGTH = 32

RE_NS_DOMAIN = settings.NS_DOMAIN.replace('.', r'\.')

USER_RE = (
    r'^[a-zA-Z0-9]{%d,%d}@%s$' % (NICK_MIN_LENGTH,
                                   NICK_MAX_LENGTH,
                                   RE_NS_DOMAIN)
)

USER_COMPILED = re.compile(USER_RE)


# All we really care about is that it is sanitary (no special characters)
BG_COLOR_RE = '^#?\w+$'
BG_COLOR_COMPILED = re.compile(BG_COLOR_RE)

def bg_color(value, message='Invalid color, try #RRGGBB'):
  if not value:
    return value
  if not BG_COLOR_COMPILED.match(value):
    raise exception.ValidationError(message)
  return value

def bg_repeat(value):
  """Convert value to one of: ('no-repeat', '')."""
  if value == 'no-repeat':
    return value
  return ''

BG_IMAGE_RE = 'default|^#?' + USER_RE[1:-1] + r'/bg_[0-9a-f]'
BG_IMAGE_COMPILED = re.compile(BG_IMAGE_RE)

def bg_image(value, message='Invalid background image path'):
  """bg_image should always be in the form returned from api.background_upload.
  The case where this wouldn't happen is if the user is calling directly into
  the API (hence why clean.bg_image() is still necessary).
  """
  if not value:
    return value
  if not BG_IMAGE_COMPILED.match(value):
    raise exception.ValidationError(message)
  return value

def datetime(value, message='Invalid datetime'):
  return cleaner.datetime(value, message)

def nick(value, message='Tên đăng nhập không hợp lệ'):
  """ expects to get a nick in one of the following forms:

  popular
  #popular
  popular@example.com
  #popular@example.com
  """
  value = encoding.smart_unicode(value)
  try:
    return user(value, message=message)
  except exception.ValidationError:
    return channel(value, message=message)

def normalize_nick(value):
  return nick(value).lower()

channel_re = re.compile(r'^#[a-zA-Z0-9]{%d,%d}@%s$' \
                                % (NICK_MIN_LENGTH,
                                   NICK_MAX_LENGTH,
                                   RE_NS_DOMAIN))

def channel(value, message=u'ID không hợp lệ'):
  """ expects to get a channel in one of the following forms:
  
  popular
  #popular
  #popular@example.com
  """
  value = encoding.smart_unicode(value)
  if not value.startswith('#'):
    value = '#%s' % value

  if not value.endswith('@%s' % settings.NS_DOMAIN):
    value = '%s@%s' % (value, settings.NS_DOMAIN)

  match = channel_re.match(value)
  if not match:
    raise exception.ValidationError(message)

  return value

def oauth_type(value, message='Invalid OAuth type'):
  if value not in ['web', 'desktop', 'mobile']:
    raise exception.ValidationError(message)
  return value

def user(value, message=u'Tên đăng nhập không hợp lệ'):
  """ expects to get a nick in one of the following forms:

  popular
  popular@example.com
  """
  value = encoding.smart_unicode(value)
  if not value.endswith('@%s' % settings.NS_DOMAIN):
    value = '%s@%s' % (value, settings.NS_DOMAIN)

  match = USER_COMPILED.match(value)
  if not match:
    raise exception.ValidationError(message)

  return value

def icon(value):
  """ ensure that the value is in ICONS and turned into an int, 0 if non int"""
  if str(value) in display.ICONS_BY_ID:
    return str(value)
  return display.ICONS.get(str(value), (0,))[0]

MOBILE_RE = '^\+\d{8,20}$'
MOBILE_RE_COMPILED = re.compile(MOBILE_RE)

def mobile(value):
  if not value.startswith('+'):
    value = '+%s' % value

  match = MOBILE_RE_COMPILED.match(value)
  if not match:
    raise exception.ValidationError('Invalid mobile number')

  return value


URL_RE = cleaner.url_re

def url(value, message='Invalid url'):
  # If no URL scheme given, assume http://
  if value and '://' not in value:
    value = u'http://%s' % value
  # If no URL path given, assume /
  if value and not urlparse.urlsplit(value)[2]:
    value += '/'

  match = URL_RE.match(value)
  if not match:
    raise exception.ValidationError(message)

  return value

def limit(value, max=100):
  try:
    value = int(value)
  except:
    value = 100

  if value > max:
    value = max

  if value < 1:
    value = 1

  return value

def redirect_to(value):
  if not value.startswith('/') and not value.startswith('http'):
    value = 'http://' + value

  if '\n' in value or '\r' in value:
    return '/'

  params = urlparse.urlparse(value.lower())

  scheme = params[0]
  netloc = params[1]
  path = params[2]

  if not scheme and not netloc and path:
    # Check for a relative URL, which is fine
    return value
  elif scheme in ('http', 'https'):
    if (netloc.endswith(settings.HOSTED_DOMAIN) or
        netloc.endswith(settings.GAE_DOMAIN)):
      if netloc.find('/') == -1:
        return value

  # URL does not match whitelist
  return '/'
