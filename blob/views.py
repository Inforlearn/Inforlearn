import logging
import re
from django import http
from common import decorator
from common import exception
from common import api
from common.models import File
from cachepy import cachepy as cache
from blob.jsmin import jsmin


def compress_css(css):  
  # remove comments - this will break a lot of hacks :-P
  css = re.sub( r'\s*/\*\s*\*/', "$$HACK1$$", css ) # preserve IE<6 comment hack
  css = re.sub( r'/\*[\s\S]*?\*/', "", css )
  css = css.replace( "$$HACK1$$", '/**/' ) # preserve IE<6 comment hack
  
  # url() doesn't need quotes
  css = re.sub( r'url\((["\'])([^)]*)\1\)', r'url(\2)', css )
  
  # spaces may be safely collapsed as generated content will collapse them anyway
  css = re.sub( r'\s+', ' ', css )
  
  # shorten collapsable colors: #aabbcc to #abc
  css = re.sub( r'#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3(\s|;)', r'#\1\2\3\4', css )
  
  # fragment values can loose zeros
  css = re.sub( r':\s*0(\.\d+([cm]m|e[mx]|in|p[ctx]))\s*;', r':\1;', css )
  
  css_data = []
  for rule in re.findall( r'([^{]+){([^}]*)}', css ):
  
      # we don't need spaces around operators
      selectors = [re.sub( r'(?<=[\[\(>+=])\s+|\s+(?=[=~^$*|>+\]\)])', r'', selector.strip() ) for selector in rule[0].split( ',' )]
  
      # order is important, but we still want to discard repetitions
      properties = {}
      porder = []
      for prop in re.findall( '(.*?):(.*?)(;|$)', rule[1] ):
          key = prop[0].strip().lower()
          if key not in porder: porder.append( key )
          properties[ key ] = prop[1].strip()
  
      # output rule if it contains any declarations
      if properties:
          css_data.append("%s{%s}" % ( ','.join( selectors ), ''.join(['%s:%s;' % (key, properties[key]) for key in porder])[:-1] ))
  return ''.join(css_data)

@decorator.cache_forever
def blob_image_jpg(request, nick, path):
  try:
    img = api.image_get(request.user, nick, path, format='jpg')
    if not img:
      return http.HttpResponseNotFound()
    content_type = "image/jpg"
    response = http.HttpResponse(content_type=content_type)
    response.write(img.content)
    return response
  except exception.ApiException, e:
    logging.info("exc %s", e)
    return http.HttpResponseForbidden()
  except Exception:
    return http.HttpResponseNotFound()

def get_archive(request):
  try:
    key_name = request.path_info[1:] # remove '/' at begin of path
    file = File.get_by_key_name(key_name)
    if not file:
      return http.HttpResponseNotFound()
    content_type = "application/x-deflate"
    response = http.HttpResponse(content_type=content_type)
    response.write(file.content)
    return response  
  except Exception:
    return http.HttpResponseNotFound()
  
@decorator.cache_forever
def css(request):
  content_type = "text/css"
  response = http.HttpResponse(content_type=content_type)
  
  path = request.path_info[1:] # remove '/' at begin of path
  css_data = cache.get(path)
  if css_data:
    response.write(css_data)
    return response
  
  try:
    css_data = open(path).read()
  except IOError:
    return http.HttpResponseNotFound()
  
  css_data = compress_css(css_data)
  cache.set(path, css_data)
  
  response.write(css_data)
  return response

@decorator.cache_forever
def js(request):
  content_type = "text/x-js"
  response = http.HttpResponse(content_type=content_type)
  
  path = request.path_info[1:] # remove '/' at begin of path
  js_data = cache.get(path)
  if js_data:
    response.write(js_data)
    return response
  
  try:
    js_data = open(path).read()
  except IOError:
    return http.HttpResponseNotFound()
  
  js_data = jsmin(js_data)
  cache.set(path, js_data)
  
  response.write(js_data)
  return response
  