#!/bin/sh

sencha compile --classpath=extjs-4.1.1a-gpl/src,examples/ux \
       exclude -file extjs-4.1.1a-gpl/src and \
       concat ux-all-debug.js and \
       concat -compress ux-all.js

sencha compile --classpath=extjs-4.1.1a-gpl/src,src \
       exclude -file extjs-4.1.1a-gpl/src and \
       concat spread-all-debug.js and \
       concat -compress spread-all.js