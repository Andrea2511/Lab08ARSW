package edu.eci.arsw.collabpaint.service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;

import edu.eci.arsw.collabpaint.model.Point;
import edu.eci.arsw.collabpaint.model.Polygon;

@Service
public class DrawingService {
    
    // Thread-safe map to store points for each drawing
    private final ConcurrentHashMap<String, CopyOnWriteArrayList<Point>> drawingsPoints = new ConcurrentHashMap<>();
    
    // Minimum points required to form a polygon
    private static final int POLYGON_MIN_POINTS = 4;
    
    /**
     * Adds a point to a specific drawing and returns a polygon if enough points are added
     * @param drawingId the drawing identifier
     * @param point the point to add
     * @return a polygon if POLYGON_MIN_POINTS are reached, null otherwise
     */
    public Polygon addPoint(String drawingId, Point point) {
        // Get or create the list of points for this drawing
        CopyOnWriteArrayList<Point> points = drawingsPoints.computeIfAbsent(
            drawingId, k -> new CopyOnWriteArrayList<>()
        );
        
        // Add the point to the list
        points.add(point);
        
        // Check if we have enough points to create a polygon
        if (points.size() >= POLYGON_MIN_POINTS) {
            Polygon polygon = new Polygon(new CopyOnWriteArrayList<>(points));
            // Clear the points to start a new polygon
            points.clear();
            return polygon;
        }
        
        return null;
    }
}