module.exports = function (grunt) {

    var dirs = {
        base: '',
        src: 'src/'
    }, baseDir = function (path) {
        return dirs.base + path;
    }, srcDir = function (path) {
        return dirs.src + path;
    };

    // Build configuration
    grunt.initConfig({
        meta: {
            version: '1.0-beta1',
            banner: '/*! Ext JS 4 SpreadSheets - v<%= meta.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '* http://www.extjs4spreadsheets.com/\n' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
                'Copyright (C) 2012, 2013 Aron Homberg; GPLv3 and commercially licensed. */'
        },
        lint: {
            files: [
            ]
        },
        concat: {
            dist: {
                src: [
                    '<banner:meta.banner>',
                    srcDir('grid/overrides/Column.js'),
                    srcDir('data/TSVTransformer.js'),
                    srcDir('data/DataMatrix.js'),
                    srcDir('selection/Position.js'),
                    srcDir('selection/RangeModel.js'),
                    srcDir('util/Clipping.js'),
                    srcDir('util/Key.js'),
                    srcDir('grid/plugin/Copyable.js'),
                    srcDir('grid/plugin/Editable.js'),
                    srcDir('grid/plugin/Pasteable.js'),
                    srcDir('grid/View.js'),
                    srcDir('grid/column/Header.js'),
                    srcDir('grid/Panel.js')
                ],
                dest: baseDir('spread-all-debug.js')
            }
        },
        min: {
            dist: {
                src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest: baseDir('spread-all.js')
            }
        },
        watch: {
            files: '<config:lint.files>',
            tasks: 'lint'
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                browser: true,
                eqnull: true,
                devel: true,
                evil: true,
                lastsemic: true,
                asi: true
            },
            globals: {
                Ada: true,
                require: true,
                GLOBAL: true,
                exports: true,
                global: true,
                Enumerable: true
            }
        },
        uglify: {
            // Uglify options
        }
    });

    // Define tasks
    grunt.registerTask('build',   'concat min');
    grunt.registerTask('test',    'build lint');
    grunt.registerTask('default', 'build');
};