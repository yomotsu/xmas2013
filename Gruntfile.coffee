# =================================
# do
#
# install growlnotify
#
# $ npm install -g coffee-script
# $ npm install
#
# Then...
# =================================
# $ grunt
# =================================

module.exports = (grunt) ->

  grunt.task.loadNpmTasks 'grunt-contrib-watch'
  grunt.task.loadNpmTasks 'grunt-contrib-concat'
  grunt.task.loadNpmTasks 'grunt-contrib-uglify'
  grunt.task.loadNpmTasks 'grunt-contrib-sass'
  grunt.task.loadNpmTasks 'grunt-contrib-cssmin'

  grunt.initConfig

    sass:
      cssAll:
        src: 'assets/css/style.scss'
        dest: 'assets/css/style.css'

    cssmin:
      cssAll:
        src: '<%= sass.cssAll.dest %>'
        dest: 'assets/css/style.min.css'

    concat:
      jsSrc:
        src: [
          'assets/js/src/xmas.js'
          'assets/js/src/util.js'
          'assets/js/src/init.js'
          'assets/js/src/ground.js'
          'assets/js/src/skybox.js'
          'assets/js/src/snow.js'
          'assets/js/src/forrest.js'
          'assets/js/src/box.js'
          'assets/js/src/santa.js'
          'assets/js/src/keyinput.js'
        ]
        dest: 'assets/js/xmas.js'

      jsLibs:
        src: [
          'assets/js/vendor/jquery-1.10.2.min.js'
          'assets/js/vendor/three.min.js'
          'assets/js/vendor/cannon.min.js'
          'assets/js/vendor/perlin-noise-simplex.js'
        ]
        dest: 'assets/js/libs.js'

    uglify:
      jsSrc:
        src: '<%= concat.jsSrc.dest %>'
        dest: 'assets/js/xmas.min.js'

    watch:
      js:
        files: ['assets/js/src/*.js']
        tasks: [ 'concat:jsSrc', 'uglify:jsSrc' ]

      jsLibs:
        files: ['assets/js/vendor/*.js']
        tasks: [ 'concat:jsLibs' ]

      sass:
        files: ['assets/css/*.scss' ]
        tasks: ['sass', 'cssmin' ]

  grunt.registerTask 'default', [
    'sass'
    'cssmin'
    'concat'
    'uglify'
  ]

