#!/bin/sh

jsduck ext-4.2.1.883-gpl/src src \
       --builtin-classes \
       --images ext-4.2.1.883-gpl/docs/images \
       --warnings=-no_doc,-dup_member,-link_ambiguous \
       --external XMLHttpRequest \
       --output docs