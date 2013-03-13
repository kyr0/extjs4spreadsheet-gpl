#!/bin/sh

sencha compile --classpath=extjs-4.1.1a-gpl/src,examples/ux,src \
       exclude -file extjs-4.1.1a-gpl/src and \
       concat spread-all-debug.js and \
       concat -compress spread-all.js