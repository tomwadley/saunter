# Saunter

A point-and-click style game inspired by Myst. The game is web based, written in JavaScript and runs entirely client side requiring only a web server to host the static files.

## Building

You will need `npm` to fetch dependencies. You'll also need `grunt` if you don't have it already:

    sudo npm install -g grunt-cli

Then, to fetch the remaining dependencies:

    npm install

To build:

    grunt

You'll need a map file and assets. To build the included test-map:

    grunt prepareStaticMap

That's it - just launch a web server such as `nws` to play the test map.

To build for production:

    grunt prod 

This will create a directory  call `build/` containing static optimized files ready to be copied to a web server. You will need to copy your map.json and any required assets into the `build/` directory manually.

To remove all build artefacts:

    grunt clean

## Maps

Map data is read from a json file called `map.json`. There are two types of maps, `static` maps and `pano` (panoramic) maps. Static maps have the player positioned in a given 2d cell and looking in a particular compass direction (N, S, E, W). The player can click in a direction to turn or to move forwards. Static mode is similar to the original Myst. In pano mode, the player is positioned in a given 2d cell but can look in all directions through an equirectangular "Photo Sphere" (like that shot with the Android camera in Photo Shpere mode). These panoramic images are rendered using [photo-sphere-viewer](https://github.com/JeremyHeleine/Photo-Sphere-Viewer). Partial support for mixing and matching static and pano cells in the one map file is supported, so strictly speaking a map doesn't have to be of only one type.

### Map files

A `map.json` file has the following format:

```json
{
  "metadata": {
    "name": "test-map",
    "version": "1.0",
    "description": "A test map",
    "imagePrefix": "test-map/",
    "imageSuffix": ".png"
  },
  "init": {
    "x": 0,
    "y": 0,
    "direction": "north"
  },
  "cells": [
  ...
  ]
}
```

`name`, `version` and `description` don't currently do anything. They exist for convenience and to future-proof the file format. `imagePrefix` and `imageSuffix` are prepended and appended respectively onto each filename referred to in the `cells` block to build a complete URL for the image. In the example above, this a relative URL but it can also be an absolute URL if for example, you wish to host your images on a CDN.

`init` is the starting position for the player. `x` and `y` are the co-ordinates of the starting cell. `direction` should be one of "north", "south", "east" or "west" for a static cell or a number in degrees for a pano cell.

A static map cell has the following format:

```json
"cells": [
 {
  "x": "0",
  "y": "0",
  "east": "0_0e",
  "north": "0_0n",
  "south": "0_0s",
  "west": "0_0w"
 },
 ...
]
```

`x` and `y` are the co-ordinates for the cell. `east`, `north`, `south` and `west` are the image filenames (without prefix and suffix) to display for each respective direction the player can face. Each direction is optional (unless implied by another cell - if you face north and move forward the cell to the north must also have a north so that the player's direction can be preserved between cell transitions).

A pano map cell has the following format:

```json
"cells": [
  {
    "x": "0",
    "y": "0",
    "pano": "myPhotoSphere",
    "targets": [
      { "angle": 218, "dest_x": 1, "dest_y": 0}
    ]
  },
  ...
]
```

`x` and `y` are the co-ordinates for the cell. `pano` is the equirectangular image to display for the cell. `targets` is an array of click targets to take the user to other cells. For a given target, `angle` is the angle (in degrees) of the target. `dest_x` and `dest_y` are the co-ordinates the player should be taken to.

### Static map templates

There is an included script (and grunt task), `prepareStaticMap` which takes an incomplete static map "template" which references a directory of images and generates the complete `map.json` file. It does this based on the file names of the images. This is a convenient way to build a static map but its use is by no means mandatory.

The script expects all images to conform to a naming scheme `x_yd` where `x` is the x-coord of the cell, `y` is the y-coord of the cell and `d` is the direction (n, s, e or w). The path to the images and their file extension can be specified by setting `imagePrefix` and `imageSuffix` respectively in the template. These settings and all other map metadata (including `init`) is copied across as is to the resulting `map.json` file.

A small map for testing is included. It has a static map template called `test-map_staticMapTemplate.json`. This references a directory of images `test-map/`. To generate the map, run:

    grunt prepareStaticMap --map=test-map_staticMapTemplate.json

This is actually the default value for `--map` so you can leave out `--map` if you wish. You can start a web server in the current directory, or if you've done a `grunt prod` for a production build, you'll need to copy the map and assets to the `build/` directory:

    cp map.json build/
    cp -r test-map/ build/

