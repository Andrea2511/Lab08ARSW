package edu.eci.arsw.collabpaint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import edu.eci.arsw.collabpaint.model.Point;
import edu.eci.arsw.collabpaint.model.Polygon;

import edu.eci.arsw.collabpaint.service.DrawingService;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    @Autowired
    DrawingService drawingService;

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:" + pt);

        // Forward the point to all subscribers
        msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);

        // Add point to the drawing service and check if a polygon can be formed
        Polygon polygon = drawingService.addPoint(numdibujo, pt);

        // If a polygon is formed, publish it
        if (polygon != null) {
            System.out.println("Nuevo poligono creado:" + polygon);
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygon);
        }
    }
}
