tracking.CatTracker = function() {
    tracking.CatTracker.base(this, 'constructor');
};

tracking.inherits(tracking.CatTracker, tracking.Tracker);

tracking.CatTracker.prototype.track = function(pixels, width, height) {

    console.log('CatTracker track args: ',arguments);

    this.emit('track', {
        // Your results here
    });
};

window.onload = function() {
    console.log('onload custom tracker');

    var port = location.port ? location.port : '80';
    ws = new WebSocket("ws://"+location.hostname+":"+port);

    var cat = document.getElementById("catImage");

    if (cat) {
        console.log("Create CatTracker");

        // Create an instance of the CatTracker
        var catTracker = new tracking.CatTracker();

        tracking.track(cat, catTracker);

        // Listen for the tracking events from ColorTracker.
        catTracker.on('track', function(event) {
            if (!event.data || event.data.length === 0) {
                // No data detected in this frame.
            } else {
                event.data.forEach(function(rect) {
                    console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
                    //ws.send(JSON.stringify({foo: 'bar'}));
                    window.plot(rect.x, rect.y, rect.width, rect.height);
                });
            }
        });
    }

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
};
