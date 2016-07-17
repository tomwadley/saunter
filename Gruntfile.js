module.exports = function(grunt) {
  var BUILD_DIR = 'build/';
  var staticMapTemplate = grunt.option('map') || 'test-map_staticMapTemplate.json';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    exec: {
      jamInstall: '$(npm bin)/jam install',
      jamCompile: '$(npm bin)/jam compile -i saunter/main -o compiled.js',
      prepareStaticMap: ('./prepareStaticMap ' + staticMapTemplate)
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
      main: {
        files: [{ 
          src: [
            'main.css',
            'compiled.js',
            'vendor/**',
            'map.json',
            'index.html'
          ], 
          dest: BUILD_DIR
        }]
      }
    },
    replace: {
      dist: {
        options: {
          patterns: [
            { match: /jam\/require\.js/g, replacement: 'compiled.js' }
          ]
        },
        files: [
          { src: ['saunter.html'], dest: BUILD_DIR }
        ]
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
      'jam',
      'compiled.js',
      'vendor',
      'tmp'
    ]
  });

  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-cache-bust');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-curl');
  grunt.loadNpmTasks('grunt-zip');

  grunt.registerTask('prod', [
    'exec:jamInstall', 
    'curl:photo_sphere_viewer',
    'unzip:photo_sphere_viewer',
    'exec:jamCompile', 
    'copy', 
    'replace', 
    'cacheBust'
  ]);

  grunt.registerTask('dev', [
    'exec:jamInstall', 
    'curl:photo_sphere_viewer',
    'unzip:photo_sphere_viewer',
  ]);

  grunt.registerTask('prepareStaticMap', [
    'exec:prepareStaticMap'
  ]);

  grunt.registerTask('default', 'dev');
};
