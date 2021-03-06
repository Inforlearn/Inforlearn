import re
from django.conf import settings
from django.utils import html
from common import component
from common.protocol import base
from common.clean import encoding
from xml.sax.saxutils import escape


class JID(object):
  _re_jid = re.compile(r'([^:/@]+)@([^/])(/.*)')
  def __init__(self, node, host, resource=None):
    self.node = node
    self.host = host
    self.resource = resource

  @classmethod
  def from_uri(cls, uri):
    # TODO(termie): very simplistic
    #m = cls._re_jid.search(uri)
    node, rest = uri.split('@', 1)
    try:
      host, rest = rest.split('/', 1)
      resource = '/' + rest
    except ValueError:
      host = rest
      resource = '/'
    return cls(node, host, resource)

  def base(self):
    return '%s@%s' % (self.node, self.host)

  def full(self):
    return '%s@%s%s' % (self.node, self.host, self.resource)

class XmppMessage(object):
  sender = None
  target = None
  message = None

  def __init__(self, sender, target, message):
    self.sender = JID.from_uri(sender)
    self.target = JID.from_uri(target)
    self.message = message

  @classmethod
  def from_request(cls, request):
    xmpp_service = component.best['xmpp_service']
    return xmpp_service.from_request(cls, request)

class XmppConnection(base.Connection):
  def send_message(self, to_jid_list, message, html_message=None,
                   atom_message=None):
    if settings.IM_TEST_ONLY:
      to_jid_list = [x for x in to_jid_list
                     if x.base() in settings.IM_TEST_JIDS]

    raw_xml = False
    message = encoding.smart_str(message)
    body = message

    if html_message or atom_message:
      raw_xml = True
      body_builder = ["<body>%s</body>" % (html.escape(body.strip())), ]
      if html_message:
        html_message = encoding.smart_str(html_message)
        body_builder.append(html_message)
      if atom_message:
        atom_message = encoding.smart_str(atom_message)
        body_builder.append(atom_message)
      body = u'\n'.join([encoding.smart_unicode(x) for x in body_builder])
      body = body.encode('ascii', 'xmlcharrefreplace')
    body = encoding.smart_unicode(body)
    xmpp_service = component.best['xmpp_service']
    xmpp_service.send_message([j.base() for j in to_jid_list],
                              body,
                              raw_xml=raw_xml)
