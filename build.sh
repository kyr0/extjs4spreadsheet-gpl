#!/bin/sh

echo "\nBuilding UX into ux-all.js and ux-all-debug.js\n\n"
/usr/bin/env sh buildux.sh

echo "\nBuilding SpreadSheet into spread-all.js and spread-all-debug.js\n\n"
/usr/bin/env sh buildspread.sh


echo "\nBuilding documentation into docs/index.html\n\n"
/usr/bin/env sh builddocs.sh
