package edu.eci.arsw.collabpaint.controller;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class PaintController {

    @MessageMapping("/newpoint")
    @SendTo("/topic/points")
    public Point sendPoint(Point point){
        return point;
    }

}
