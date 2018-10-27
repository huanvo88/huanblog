#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = 'Huan Vo'
SITENAME = "Huan's Blog"
SITEURL = ''

PATH = 'content'
PAGE_PATHS = ['pages']
ARTICLE_PATHS = ['posts']
STATIC_PATHS = [ 'extra', 'images','notes','handouts','subpages']


TIMEZONE = 'America/Toronto'

DEFAULT_LANG = 'English'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

#AVATAR
#AVATAR = './images/profile.jpg'

#BANNER
BANNER = './images/banner.jpg'

# Blogroll
#LINKS = (('Pelican', 'http://getpelican.com/'),
#         ('Python.org', 'http://python.org/'),
#         ('Jinja2', 'http://jinja.pocoo.org/'),
#         ('You can modify those links in your config file', '#'),)

LINKS = (('Dataquest Blog','https://www.dataquest.io/blog/'),
	      ('Towards Data Science', 'https://medium.com/towards-data-science/data-science/home'),
	      ('Quanta Magazine', 'https://www.quantamagazine.org/'))

# Social widget
#SOCIAL = (('You can add links in your config file', '#'),
#          ('Another social link', '#'),)
SOCIAL = (('linkedin', 'https://www.linkedin.com/in/huan-vo-5b783b128/','linkedin'),
	       ('github', 'https://github.com/huanvo88/Projects','github'))

DEFAULT_PAGINATION = 5

# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True
PLUGIN_PATHS = ['pelican-plugins']

#bootstrap theme
THEME = 'pelican-themes/pelican-bootstrap3'
BOOTSTRAP_THEME = 'flatly'
#BOOTSTRAP_THEME = 'darkly'
#BOOTSTRAP_THEME = 'lux'
#BOOTSTRAP_THEME = 'litera'
#BOOTSTRAP_THEME = 'sandstone'
#BOOTSTRAP_THEME = 'cosmo'
#BOOTSTRAP_THEME = 'simplex'
#BOOTSTRAP_THEME = 'spacelab'

#Navbar
#BOOTSTRAP_NAVBAR_INVERSE = True

PLUGIN_PATHS = ['./pelican-plugins','./plugins']
JINJA_ENVIRONMENT = {'extensions': ['jinja2.ext.i18n']}

#ipynb file
MARKUP = ('md','ipynb')

PLUGINS = [
    'i18n_subsites',
    'series',
    'tag_cloud',
    'liquid_tags.youtube',
    'liquid_tags.notebook',
    'liquid_tags.include_code',
    'render_math',
    'pelican-ipynb.markup']

#I18N_TEMPLATES_LANG = 'en'

DIRECT_TEMPLATES = ('index','tags', 'categories', 'authors', 'archives')

CUSTOM_CSS = 'static/css/custom.css'
CUSTOM_JS = 'static/js/custom.js'



EXTRA_PATH_METADATA = {
    'extra/custom.css': {'path': 'static/css/custom.css'},
    'extra/custom.js': {'path': 'static/js/custom.js'}
}

# Top menus
DISPLAY_CATEGORIES_ON_MENU = False
DISPLAY_PAGES_ON_MENU = True

#publishconf.py
SITEURL = 'https://huanvo88.github.io/huanblog'
RELATIVE_URLS = True

#Disqus
DISQUS_SITENAME = "huan-2"

DISQUS_NO_ID = True

DISQUS_DISPLAY_COUNTS = True

DISQUSURL = 'https://huanvo88.github.io'