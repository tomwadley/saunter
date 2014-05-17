# Saunter

A point-and-click style game inspired by Myst. The game is web based, written in Javascript and runs entirely client side requiring only a web server to host the static files.

## Setup

You will need `npm` and `jam` to fetch dependencies.

Map data is read from a json file. A small map for testing is included called `test-map.json`. This references a directory of images `test-map/`. There is a pre-processing step which reads the file names in the image directory and populates the map json with cell data. To do this, run:

    ./prepareMap test-map.json > map.json

Prepare map expects all images to conform to a naming scheme `x_yd` where `x` is the x-coord of the cell, `y` is the y-coord of the cell and `d` is the direction (n, s, e or w).

The entire directory can now be served statically with a web server. For development purposes, I use `nws` which spins up a web server on port 3030 serving the files in the current directory.

