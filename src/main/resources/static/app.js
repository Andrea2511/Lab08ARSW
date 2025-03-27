var app = (function () {

    var stompClient = null;
    var canvas = null;
    var context = null;
    
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }        
    }
    
    var init = function () {
        // Initialize canvas when page loads
        canvas = document.getElementById("canvas");
        context = canvas.getContext("2d");
        
        // Add event listener for canvas
        canvas.addEventListener('mousedown', function (evt) {
            // Only allow drawing when connected
            if (stompClient !== null) {
                var mousePos = getMousePosition(canvas, evt);
                publishPoint(mousePos.x, mousePos.y);
                drawPoint(mousePos.x, mousePos.y);
            } else {
                alert("Please connect first before drawing!");
            }
        });
    };

    var connect = function () {
        // Get the drawing ID
        var drawingId = document.getElementById("drawingId").value;
        
        // Validate input
        if (!drawingId || drawingId.trim() === '') {
            alert("Please enter a valid drawing ID!");
            return;
        }
        
        // Disable connect button and update status while connecting
        document.getElementById("connectBtn").disabled = true;
        document.getElementById("connectionStatus").innerHTML = "Connecting...";
        
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            
            // Subscribe to the points topic
            stompClient.subscribe('/topic/newpoint.' + drawingId, function (eventbody) {
                var point = JSON.parse(eventbody.body);
                drawPoint(point.x, point.y);
            });
            
            // Subscribe to the polygon topic
            stompClient.subscribe('/topic/newpolygon.' + drawingId, function (eventbody) {
                var polygon = JSON.parse(eventbody.body);
                drawPolygon(polygon.points);
            });
            
            // Update UI to show connected status
            document.getElementById("connectionStatus").innerHTML = 
                "Connected to drawing #" + drawingId;
            document.getElementById("drawingId").disabled = true;
        }, function(error) {
            // If connection fails
            console.log('Error: ' + error);
            document.getElementById("connectBtn").disabled = false;
            document.getElementById("connectionStatus").innerHTML = 
                "Connection failed: " + error;
        });
    };

    var publishPoint = function (px, py) {
        var drawingId = document.getElementById("drawingId").value;
        var pt = new Point(px, py);
        console.log("Publishing point: " + JSON.stringify(pt));
        
        // Send to app destination
        stompClient.send("/app/newpoint." + drawingId, {}, JSON.stringify(pt));
    };

    var getMousePosition = function (canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round(evt.clientX - rect.left),
            y: Math.round(evt.clientY - rect.top)
        };
    };
    
    var drawPoint = function (px, py) {
        context.beginPath();
        context.arc(px, py, 3, 0, 2 * Math.PI);
        context.fillStyle = "#000000";
        context.fill();
    };
    
    var drawPolygon = function (points) {
        if (points.length < 3) return; // Need at least 3 points for a polygon
        
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        
        // Draw lines to all other points
        for (var i = 1; i < points.length; i++) {
            context.lineTo(points[i].x, points[i].y);
        }
        
        // Close the polygon
        context.closePath();
        
        // Style the polygon
        context.lineWidth = 2;
        context.strokeStyle = "#FF0000";
        context.stroke();
        
        // Fill with semi-transparent color
        context.fillStyle = "rgba(255, 0, 0, 0.2)";
        context.fill();
    };
    
    return {
        init: init,
        connect: connect
    };
})();

// Initialize the canvas when page loads
document.addEventListener('DOMContentLoaded', function() {
    app.init();
});