#! /usr/bin/env python
#! coding: utf-8
# pylint: disable-msg=W0311

## @update - Jun 27, 2010
#  Auto update new version to Google AppEngine

from os import system

system("mv .local_settings.py local_settings.py")
system("python2.6 manage.py update")
system("mv local_settings.py .local_settings.py")
