var express = require('express'),
    toJson = require('./convert-to-json'),
    fromJson = require('./convert-from-json');

var app = null;

exports.createServer = function(port,maxBuffer,gaCode){
    app = express();
    port || (port = 3000);

    if(maxBuffer) ogre_engine.setMaxBuffer(maxBuffer);

    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.static(__dirname + '/public'))
    app.use(express.bodyParser())

    app.get('/', function(req, res){
        res.render('home', { trackcode: gaCode || '' })
    })

    app.post('/convert', function(req, res){
        toJson.upload(req,
            function(outputstream,contentType,launchViewer){
                if(launchViewer)
                    res.render('viewer', { output: outputstream, trackcode: gaCode || '' });
                else {
                    res.header("Content-Type",contentType);
                    res.send(outputstream);
                }
            }
        )
    })

    app.post('/convertJson', function(req, res){
        outputName = (req.body.name || 'ogreToShape') + '.zip';
        fromJson.upload(req,
            function(err, outputZipFile){
                if(err){
                    res.send(err);
                } else {
                    res.download(outputZipFile, outputName, function(err){
                        fromJson.removeOutputFile(outputZipFile);
                    });
                }
            }
        )
    })

    app.use(function(err, req, res, next){
        console.log(err);
        res.send(err.message, 500);
    })

    app.listen(port);
    console.log("Ogre started, listening on port " + port);

    return true;
}
