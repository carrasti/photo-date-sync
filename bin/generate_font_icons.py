import sys
from sys import stderr
import re
import os
import glob
import simplejson

SRCDIR = os.path.realpath(os.path.join(os.path.dirname(__file__), '..'))

try:
    import fontforge
except Exception, e:
    print """
Fontforge not installed in the system.

Install: sudo apt-get install python-fontforge

"""
    sys.exit(1)

SOURCE_SVG_DIR = os.path.join(SRCDIR, 'public', 'images', 'icons', 'svg')
TARGET_TTF_DIR = os.path.join(SRCDIR, 'public',  'css')
TARGET_SCSS_DIR = os.path.join(SRCDIR, 'public',  'sass', 'fonticons')
TTF_FILENAME = 'photosync_icons.ttf'
SCSS_FILENAME = 'photosync_icons.scss'
JSON_FILENAME = 'photosync_icons.json'

SCSS_HEADER_TEMPLATE = """
@font-face {
font-family: PhotoSyncIcons;
src: url('%s');
}

.icon:before {
font-family: 'PhotoSyncIcons';
}
""" % TTF_FILENAME
SCSS_ICON_TEMPLATE = ".icon-%s:before {content: '\%04X';}\n"




# indicates the distance to separate the glyph from the borders of the
# font. The scale is 0-1000
KERNING = 15


characters = []

# get the svg files to be added to the file
files = list(glob.glob1(SOURCE_SVG_DIR, "*.svg"))

print "Generating font with %d svg files..." % len(files)

#sort the list of files alphabetically
files.sort(cmp=lambda a, b: a.lower() > b.lower)

# create the fontforge font and add metadata
font = fontforge.font()
setattr(font, 'fontname', 'nuageicons');
setattr(font, 'fullname', 'NuageIcons');
setattr(font, 'familyname', 'NuageIcons');

# scss file to write with all the definitions
scss_content = SCSS_HEADER_TEMPLATE

# starts in the character code for !
character_index = 33

# add the files to the glyph
for glyph_filename in files:
    character = dict(filename=glyph_filename, \
         name=glyph_filename.split('.')[0], \
         index=character_index,
         chr=chr(character_index))

    characters.append(character)

    #create the character in the font
    c = font.createChar(character_index)
    #import the svg file
    c.importOutlines(os.path.join(SOURCE_SVG_DIR, glyph_filename))
    #set the margins to the vectorial image
    c.left_side_bearing = KERNING
    c.right_side_bearing = KERNING

    scss_content = scss_content + SCSS_ICON_TEMPLATE % (
                                            character['name'],
                                            character['index'])
    character_index += 1

#save the font file
try:
    ttf_filename = os.path.join(TARGET_TTF_DIR, TTF_FILENAME)
    font.generate(ttf_filename)
except:
    stderr.write("Cannot write to file %s\n" % ttf_filename)
    sys.exit(1)

#save the scss file
scss_file = open(os.path.join(TARGET_SCSS_DIR, SCSS_FILENAME), 'w')
scss_file.write(scss_content)
scss_file.close()

#save a json file with the list of glyphs and mapping,etc
json_file = open(os.path.join(TARGET_TTF_DIR, JSON_FILENAME), 'w')
json_file.write(simplejson.dumps(characters))
json_file.close()

print ("Font generated!\n%d fonts added\n" % len(characters))
sys.exit(0)
