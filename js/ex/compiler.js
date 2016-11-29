
var vscode = require('vscode');
var workspace = vscode.workspace;
var window = vscode.window;

var cfg = require('./config');
var fs = require('../fs');
var work = require('../work');
var closure = require('../closure');
var util = require('../util');

var latestCompilePath = '';

function getSelectedPath()
{
    var doc = window.activeTextEditor.document;
    var localpath = doc.fileName.replace(/\\/g, '/');
    return localpath.substr(0, localpath.lastIndexOf('/')+1);
}


var MAKEJSON_DEFAULT = 
{
    "name": "jsproject",
    "src": "script.js", 
    "output": "./script.min.js",
    "includeReference": true,
    "closure": {}
};

module.exports = {
    load : function () {

    },
    unload: function() {

    },
    commands: {
        'ftpkr.makejson':function (){
            var makejson = fs.worklize(getSelectedPath() + "make.json");
            return fs.initJson(makejson, MAKEJSON_DEFAULT)
            .then(() => util.open(makejson))
            .catch(util.error);
        },
        'ftpkr.closureCompile':function (){
            return cfg.loadTest()
            .then(() => workspace.saveAll())
            .then(() => work.compile.add(() => {
                    if (!window.activeTextEditor) return;
					var path = getSelectedPath() + "make.json";
                    return closure.make(path)
					.then(() => { latestCompilePath = path; })
					.catch((err)=>{
						if (latestCompilePath && err.code === 'ENOENT')
						{
							return closure.make(latestCompilePath)
							.catch(util.log);
						}
						util.log(err);
					})
                })
            );
        },
        'ftpkr.closureCompileAll': function(){
            return cfg.loadTest()
            .then(() => workspace.saveAll())
            .then(() => work.compile.add(() => closure.all())
                .catch(util.error)
            );
        }
    }
};