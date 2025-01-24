const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory storage for devices
let devices = {};
const HEARTBEAT_TIMEOUT = 15000; // 15 seconds (adjust as needed)

// Endpoint to receive heartbeats
app.post('/heartbeat', (req, res) => {
    const { clientId, timestamp, status, additionalInfo, lol } = req.body;

    if (!clientId || !timestamp || !status) {
        return res.status(400).send('Missing required fields');
    }

    const numericTimestamp = Number(timestamp);
    if (isNaN(numericTimestamp) || numericTimestamp.toString().length !== 13) {
        return res.status(400).send('Invalid timestamp format');
    }

    // Update device information and set lastHeartbeat to now
    devices[clientId] = {
        timestamp: numericTimestamp,
        status: 'active',
        additionalInfo: additionalInfo || 'N/A',
        lol: lol || 'N/A',
        lastHeartbeat: Date.now(),
    };

    res.send({ message: 'Heartbeat received' });
});

// Endpoint to get all devices
app.get('/devices', (req, res) => {
    const deviceList = Object.entries(devices).map(([clientId, data]) => ({
        clientId,
        timestamp: data.timestamp,
        status: data.status,
    }));
    res.json(deviceList);
});

// Endpoint to get a specific device
app.get('/devices/:clientId', (req, res) => {
    const { clientId } = req.params;
    if (!devices[clientId]) {
        return res.status(404).send('Device not found');
    }
    res.json({ clientId, ...devices[clientId] });
});

// Periodically check for inactive devices
setInterval(() => {
    const now = Date.now();
    for (const [clientId, device] of Object.entries(devices)) {
        if (now - device.lastHeartbeat > HEARTBEAT_TIMEOUT) {
            devices[clientId].status = 'inactive';
        }
    }
}, 5000); // Check every 5 seconds

// Serve the static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback route for frontend routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
