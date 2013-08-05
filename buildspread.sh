#!/bin/sh

sencha compile --classpath=ext-4.2.1.883-gpl/src,src \
       exclude -file ext-4.2.1.883-gpl/src and \
       concat spread-all-debug.js and \
       concat -compress spread-all.js