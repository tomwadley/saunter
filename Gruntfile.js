module.exports = function(grunt) {
  var BUILD_DIR = 'build/';
  var map = grunt.option('map') || 'test-map.json';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    exec: {
      jamInstall: '$(npm bin)/jam install',
      jamCompile: '$(npm bin)/jam compile -i saunter/main -o compiled.js',
      prepareMapProd: ('./prepareMap ' + map + ' ' + BUILD_DIR),
      prepareMapDev: ('./prepareMap ' + map)
    },
    curl: {
      photo_sphere_viewer: {
        src: 'https://github.com/JeremyHeleine/Photo-Sphere-Viewer/archive/v2.5.zip',
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
            'compiled.js'
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
          { src: ['index.html'], dest: BUILD_DIR }
        ]
      }
    },
    cacheBust: {
      assets: {
        files: [{
          src: [BUILD_DIR + 'index.html']
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
    'exec:prepareMapProd', 
    'copy', 
    'replace', 
    'cacheBust'
  ]);

  grunt.registerTask('dev', [
    'exec:jamInstall', 
    'curl:photo_sphere_viewer',
    'unzip:photo_sphere_viewer',
    'exec:prepareMapDev'
  ]);

  grunt.registerTask('default', 'dev');
};
