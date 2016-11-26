module.exports = function(grunt) {
  var BUILD_DIR = 'build/';
  var staticMapTemplate = grunt.option('map') || 'test-map_staticMapTemplate.json';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    exec: {
      prepareStaticMap: ('./prepareStaticMap ' + staticMapTemplate)
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: '.',
          name: 'main',
          mainConfigFile: 'main.js',
          paths: {requireLib: 'require'},
          include: 'requireLib',
          out: BUILD_DIR + 'require.js'
        }
      }
    },
    curl: {
      photo_sphere_viewer: {
        src: 'https://github.com/JeremyHeleine/Photo-Sphere-Viewer/archive/v2.7.zip',
        dest: 'tmp/photo-sphere-viewer.zip'
      }
    },
    unzip: {
      photo_sphere_viewer: {
        src: 'tmp/photo-sphere-viewer.zip',
        dest: 'vendor/photo-sphere-viewer/',
        router: function(f) {
          return f.substring(f.indexOf('/'));
        }
      }
    },
    copy: {
      require: {
        files: [{
          src: ['node_modules/requirejs/require.js'],
          dest: './',
          flatten: true,
          expand: true
        }]
      },
      build: {
        files: [{ 
          src: [
            'main.css',
            'index.html',
            'vendor/**',
            'map.json',
            'saunter.html'
          ], 
          dest: BUILD_DIR
        }]
      }
    },
    cacheBust: {
      assets: {
        files: [{
          src: [BUILD_DIR + 'saunter.html']
        }]
      }
    },
    clean: [
      BUILD_DIR,
      'require.js',
      'vendor',
      'tmp'
    ]
  });

  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-cache-bust');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('prod', [
    'curl:photo_sphere_viewer',
    'unzip:photo_sphere_viewer',
    'copy:require',
    'requirejs',
    'copy:build',
    'cacheBust'
  ]);

  grunt.registerTask('dev', [
    'curl:photo_sphere_viewer',
    'unzip:photo_sphere_viewer',
    'copy:require'
  ]);

  grunt.registerTask('prepareStaticMap', [
    'exec:prepareStaticMap'
  ]);

  grunt.registerTask('default', 'dev');
};
