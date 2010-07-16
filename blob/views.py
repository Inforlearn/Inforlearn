import logging
from django import http
from common import decorator
from common import exception
from common import api
from common.models import File

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