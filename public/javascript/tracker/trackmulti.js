window.onload = function() {
    console.log('onload tracker');

    var port = location.port ? location.port : '80';
    ws = new WebSocket("ws://"+location.hostname+":"+port);

    var video = document.getElementById("myVideo");

    // Register a custom color - ColorTracker defaults to 3 colors ('magenta', 'cyan', 'yellow').
    tracking.ColorTracker.registerColor('red', function(r, g, b) {
        if (r > 200 && g < 50 && b < 50) {
            return true;
        }
        return false;
    });

    // Create an instance of the ColorTracker
    var colorTracker = new tracking.ColorTracker(['magenta', 'cyan', 'yellow', 'red']);

    tracking.track(video, colorTracker, {camera: true});

    // Listen for the tracking events from ColorTracker.
    colorTracker.on('track', function(event) {
        if (event.data.length === 0) {
            // No colors were detected in this frame.
        } else {
            event.data.forEach(function(rect) {
                //console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
                console.log("You are holding up a ",rect.color," postIt note");
                ws.send(JSON.stringify({color: rect.color}));
            });
        }
    });

    // Create an instnace of an ObjectTracker to track a feature of the face.
    var featureTracker = new tracking.ObjectTracker("mouth");
    featureTracker.setStepSize(1.7);

    tracking.track(video, featureTracker, {camera: true});

    // Listen for the tracking events from featureTracker.
    featureTracker.on('track', function(event) {
        var rect = document.querySelector('.demo-container > div.mouth-rect');
        rect.style.left = -1000+"px"; // hide the rect we're using for mouth-outline
        if (event.data.length === 0) {
            // Nothing was detected in this frame.
        } else {
            event.data.forEach(function(rect) {
                console.log(rect.x, rect.y, rect.height, rect.width);
                if (rect.height >= 30 && rect.width >= 50) {
                    console.log("You are similing");
                    ws.send(JSON.stringify({expression: "smile"}));
                } else {
                    console.log("Turn that frown upside-down");
                    ws.send(JSON.stringify({expression: "frown"}));
                }
                window.plot(rect.x, rect.y, rect.width, rect.height);
            });
        }
    });

    window.plot = function(x, y, w, h) {
        //var rect = document.createElement('div');
        //document.querySelector('.demo-container').appendChild(rect);
        var rect = document.querySelector('.demo-container > div.mouth-rect');
        //rect.classList.add('mouth-rect');
        rect.style.width = w + 'px';
        rect.style.height = h + 'px';
        rect.style.left = (video.offsetLeft + x) + 'px';
        rect.style.top = (video.offsetTop + y) + 'px';
    };

    //}
};
