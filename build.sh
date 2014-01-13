cat src/qededitor.js \
    src/qededitormenu.js \
    src/sdderivation.js \
    src/sdtask.js \
    src/sdassumption.js \
    src/sdobservation.js \
    src/sdterm.js \
    src/sdrelation.js \
    src/sdmotivation.js \
    src/qedbuttonpanel.js \
    src/qededitevents.js \
    src/qedplugin.js \
    > build/sdeditor.js

yui-compressor -o build/sdeditor.min.js build/sdeditor.js