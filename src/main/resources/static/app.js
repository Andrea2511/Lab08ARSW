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
            
            // Subscribe to the dynamic topic using the drawing ID
            stompClient.subscribe('/topic/newpoint.' + drawingId, function (eventbody) {
                var point = JSON.parse(eventbody.body);
                drawPoint(point.x, point.y);
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
        
        // Send to the dynamic topic based on drawing ID
        stompClient.send("/topic/newpoint." + drawingId, {}, JSON.stringify(pt));
    };

    var getMousePosition = function (canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };
    
    var drawPoint = function (px, py) {
        context.beginPath();
        context.arc(px, py, 3, 0, 2 * Math.PI);
        context.fillStyle = "#000000";
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