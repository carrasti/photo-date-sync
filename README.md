Photo date synchronizer
=======================

Is an HTML5 web tool which allows to synchronize the dates in pictures taken
using different cameras.

The basic use case for it is creating a time ordered sequence of pictures taken
by different people in the same period of time.

Take for example a holiday trip, everybody takes similar pictures and cameras
are usually not synchronized. This tool provides an easy way to synchronize
them.

STATUS
------

The tool is still far from being in alpha phase, but some functionality is
already implemented for it and working fine.

INSTALLATION
------------

Currently the tool is only supported under linux. The installation instructions
are for Ubuntu linux:

Install needed libraries and applications as superuser:

`
sudo apt-get install git ssh nodejs npm imagemagick libimage-exiftool-perl libexiv2-dev
`

Clone the repository or get a zipped copy from github go into its directory.
Then fetch all the nodejs requirements using npm

`cd photo-date-sync`
`npm install`

Finally run the application:

`
node app.js
`

Then in a web browser (Mozilla Firefox or Google Chrome/Cromium) the application
can be accessed in the address `http://localhost:8001`

### Configure paths to access your pictures

As the tool is still under development paths to local files have to be
hardcoded, later on time a file browser to select directories will be provided,
but for now to change it go to file:

[tree/master/public/js]

And add the **absolute** paths to the folders you want to synchronize. Note that
when reading the directory it is done recursively


ACKNOWLEDGEMENTS / LIBRARIES USED
---------------------------------

A rough list of all the libraries used and their licenses:

<table>
<tr><td colspan="2">**Backend**</td></tr>
<tr><td>Nodejs</td><td></td></tr>
<tr><td>Npm</td><td></td></tr>
<tr><td>Expressjs</td><td></td></tr>
<tr><td>Jinjs</td><td></td></tr>
<tr><td>exiv2</td><td></td></tr>
<tr><td>node-exiv2</td><td></td></tr>
<tr><td>exiv2</td><td></td></tr>
<tr><td>imagemagick</td><td></td></tr>
<tr><td>node-imagemagick</td><td></td></tr>
<tr><td>exiftool</td><td></td></tr>
<tr><td>node-walk</td><td></td></tr>
<tr><td></td><td></td></tr>
<tr><td colspan="2">**Frontend**</td></tr>
<tr><td>requirejs</td><td></td></tr>
<tr><td>backbonejs</td><td></td></tr>
<tr><td>underscorejs</td><td></td></tr>
<tr><td>jQuery</td><td></td></tr>
<tr><td>jquery.ui</td><td></td></tr>
<tr><td>jquery.mousewheel</td><td></td></tr>
<tr><td colspan="2">**Other libraries/tools**</td></tr>
<tr><td>sass</td><td></td></tr>
<tr><td>compass</td><td></td></tr>
<tr><td>fontforge</td><td></td></tr>
</table>

LICENSE
-------

TBD...
