#!/bin/sh

jsduck extjs-4.1.1a-gpl/src src \
       --builtin-classes \
       --images extjs-4.1.1a-gpl/docs/images \
       --warnings=-no_doc,-dup_member,-link_ambiguous \
       --external XMLHttpRequest \
       --output docs