module.exports = function (grunt) {
  var readOptionalJSON = function (filepath) {
      var data = {};
      try {
        data = grunt.file.readJSON(filepath);
      } catch (e) {
      }
      return data;
    },
    srcHintOptions = readOptionalJSON('.jshintrc'),
    pkg = grunt.file.readJSON('package.json'),
    source = 'src/',
    todoSource = 'examples/demo/js/';

  grunt.initConfig({
    pkg: pkg,
    jshint: {
      dist: {
        src: [ "lib/*.js" ],
        options: srcHintOptions
      }
    },
    compress: {
      koyote: {
        options: {
          mode: 'gzip'
        },
        expand: true,
        cwd: 'versions/koyote/',
        src: 'koyote.min.js',
        dest: 'versions/koyote/'
      },
      widget: {
        options: {
          mode: 'gzip'
        },
        expand: true,
        cwd: 'versions/widget/',
        src: 'widget.min.js',
        dest: 'versions/widget/'
      },
      todo: {
        options: {
          mode: 'gzip'
        },
        expand: true,
        cwd: 'versions/todo/',
        src: 'todo.min.js',
        dest: 'versions/todo/'
      }
    },
    uglify: {
      options: {
        sourceMappingURL: "koyote.min.map",
        banner: '/*! Koyote.js v<%= pkg.version %> | Date:<%= grunt.template.today("yyyy-mm-dd") %> |' +
          ' License: https://raw.github.com/tcorral/Koyote.js/master/LICENSE|' +
          ' (c) 2014\n' +
          '//@ sourceMappingURL=<%= uglify.options.sourceMappingURL%>\n' +
          '*/\n',
        preserveComments: "some",
        report: "min",
        beautify: {
          ascii_only: true
        },
        compress: {
          hoist_funs: false,
          join_vars: false,
          loops: false,
          unused: false
        },
        mangle: {
          // saves some bytes when gzipped
          except: [ "undefined" ]
        }
      },
      koyote: {
        sourceMap: '<%= compress.koyote.dest %><%= uglify.options.sourceMappingURL%>',
        src: source + 'Koyote.js',
        dest: '<%= compress.koyote.dest %><%= compress.koyote.src %>'
      },
      widget: {
        sourceMap: '<%= compress.widget.dest %><%= uglify.options.sourceMappingURL%>',
        src: [
          source + 'Koyote.js',
          source + 'Bus.js',
          source + 'Component.js',
          source + 'Widget.js'
        ],
        dest: '<%= compress.widget.dest %><%= compress.widget.src %>'
      },
      todo: {
        sourceMap: '<%= compress.todo.dest %><%= uglify.options.sourceMappingURL%>',
        src: [
          source + 'Koyote.js',
          source + 'Bus.js',
          source + 'Component.js',
          source + 'Widget.js',
          todoSource + 'TodoItem.js',
          todoSource + 'TodoList.js',
          todoSource + 'TodoStorage.js',
          todoSource + 'TodoAdd.js'
        ],
        dest: '<%= compress.todo.dest %><%= compress.todo.src %>'
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('koyote', ['jshint', 'uglify:koyote', 'compress:koyote']);
  grunt.registerTask('widget', ['jshint', 'uglify:widget', 'compress:widget']);
  grunt.registerTask('todo', ['jshint', 'uglify:todo', 'compress:todo']);
  grunt.registerTask('default', ['koyote', 'widget', 'todo']);
};