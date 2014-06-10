# Saunter

A point-and-click style game inspired by Myst. The game is web based, written in Javascript and runs entirely client side requiring only a web server to host the static files.

## Building

You will need `npm` to fetch dependencies. To do this, run:

    npm install

To build, run:

    grunt

That's it - just launch a web server such as `nws` to play the test map.

To build for production:

    grunt prod 

This will create a directory  call 'build/' containing static optimized files ready to be copied to a web server.

To remove all build artifacts:

    grunt clean

## Maps

Map data is read from a json file. A small map for testing is included called `test-map.json`. This references a directory of images `test-map/`. There is a build step (`prepareMap` run via `grunt`) which reads the file names in the image directory and populates a file called `map.json` with cell data. To specify a different map, run `grunt` with the `map` flag:

    grunt --map=my-map.json

Or for a production build,

    grunt prod --map=my-map.json

### Map files

If you wish, you can run `prepareMap` directly rather than running it via `grunt`:

    ./prepareMap my-map.json

Prepare map expects all images to conform to a naming scheme `x_yd` where `x` is the x-coord of the cell, `y` is the y-coord of the cell and `d` is the direction (n, s, e or w).

The path to the images and their file extension can be specified by setting `imagePrefix` and `imageSuffix` respectively.

When you run `prepareMap`, a new file `map.json` will be created which is the same as the map source json file except that it also contains cell data generated from the images conforming to the naming scheme. 

