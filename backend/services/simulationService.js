const DANGER_ZONE = { lat: 23.176688, lng: 80.025584 };

const simulateUsers = async (io, userCount = 100, center = { lat: 23.1777, lng: 80.0250 }) => {
    console.log(`Starting crowd simulation at IIITDM Jabalpur with ${userCount} points...`);
    console.log(`Injecting Static Danger Zone at Sector-7: ${DANGER_ZONE.lat}, ${DANGER_ZONE.lng}`);

    // Initial random points
    let points = Array.from({ length: userCount }, () => ({
        lat: center.lat + (Math.random() - 0.5) * 0.01,
        lng: center.lng + (Math.random() - 0.5) * 0.01,
        density: Math.random() * 0.6, // Low to Mid density for ambient crowd
    }));

    // Inject high-density points for the Danger Zone cluster
    const clusterSize = 50;
    const cluster = Array.from({ length: clusterSize }, () => ({
        lat: DANGER_ZONE.lat + (Math.random() - 0.5) * 0.0012, // Slightly larger spread
        lng: DANGER_ZONE.lng + (Math.random() - 0.5) * 0.012,
        density: 0.95 + Math.random() * 0.05, // High density (Red)
    }));

    points = [...points, ...cluster];

    let alertSent = false;

    const intervalId = setInterval(async () => {
        // Move ambient points
        points = points.map((p, idx) => {
            if (idx >= userCount) return p; // Keep Danger Zone static for tracking
            return {
                lat: p.lat + (Math.random() - 0.5) * 0.0005,
                lng: p.lng + (Math.random() - 0.5) * 0.0005,
                density: p.density,
            };
        });

        // Heatmap syncing removed as requested
        // io.emit('heatmapSync', heatmapData);

        // Periodically emit a Mock Emergency Alert for the Danger Zone
        if (!alertSent || Math.random() > 0.95) {
            const mockAlert = {
                _id: 'mock-' + Date.now(),
                description: '⚠️ CRITICAL: Cluster Flux detected Sector-7 Intersection. High density anomaly at Gate Intersection.',
                location: { type: 'Point', coordinates: [DANGER_ZONE.lng, DANGER_ZONE.lat] },
                created_at: new Date().toISOString(),
                image_url: 'https://images.unsplash.com/photo-1541888941259-79273a460da1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
                ctz_id: 'SYSTEM',
                ord_id: 'null',
            };
            io.emit('newReportMarker', mockAlert);
            alertSent = true;
        }

    }, 3000);

    return intervalId;
};

module.exports = { simulateUsers };
