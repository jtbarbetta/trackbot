//document.onreadystatechange = function () {
window.onload = function() {
    //if (document.readyState === "interactive") {
    console.log('onload color');

    tracking.ColorTracker.registerColor('red', function(r, g, b) {
        if (r > 200 && g < 50 && b < 50) {
            return true;
        }
        return false;
    });

    var video = document.getElementById("myVideo");
    var colors = new tracking.ColorTracker(['magenta', 'cyan', 'yellow', 'red']);

    tracking.track(video, colors, {camera: true});

    colors.on('track', function(event) {
        if (event.data.length === 0) {
            // No colors were detected in this frame.
        } else {
            event.data.forEach(function(rect) {
                console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
            });
        }
    });

    //}
};
