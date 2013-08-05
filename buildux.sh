#!/bin/sh

sencha compile --classpath=ext-4.2.1.883-gpl/src,examples/ux \
       exclude -file ext-4.2.1.883-gpl/src and \
       concat ux-all-debug.js and \
       concat -compress ux-all.js