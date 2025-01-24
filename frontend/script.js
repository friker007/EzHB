dayjs.extend(dayjs_plugin_relativeTime);

const API_URL = 'http://localhost:3000';

// Fetch devices and populate the dashboard
async function fetchDevices() {
    try {
        const response = await fetch(`${API_URL}/devices`);
        const devices = await response.json();

        const tableBody = document.getElementById('deviceTableBody');
        tableBody.innerHTML = '';

        devices.forEach(device => {
            const row = document.createElement('tr');

            const idCell = document.createElement('td');
            idCell.textContent = device.clientId;

            const timeCell = document.createElement('td');
            timeCell.textContent = dayjs(device.timestamp).fromNow();
            timeCell.title = dayjs(device.timestamp).format('DD-MMM-YYYY, hh:mm:ss A');

            const statusCell = document.createElement('td');
            const statusDot = document.createElement('span');
            statusDot.className = `status-dot status-${device.status.toLowerCase()}`;
            statusCell.appendChild(statusDot);

            const actionCell = document.createElement('td');
            const button = document.createElement('button');
            button.textContent = 'View Info';
            button.onclick = () => fetchClientInfo(device.clientId);
            actionCell.appendChild(button);

            row.appendChild(idCell);
            row.appendChild(timeCell);
            row.appendChild(statusCell);
            row.appendChild(actionCell);

            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error('Error fetching devices:', err.message);
    }
}

// Fetch detailed info about a specific client
async function fetchClientInfo(clientId) {
    const response = await fetch(`${API_URL}/devices/${clientId}`);
    const data = await response.json();

    document.getElementById('clientInfo').innerHTML = `
        <p>Client ID: ${data.clientId}</p>
        <p>Status: ${data.status}</p>
        <p>Additional Info: ${data.additionalInfo}</p>
        <p>Lol: ${data.lol}</p>
    `;

    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('infoModal').style.display = 'block';
}

// Close the modal
function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('infoModal').style.display = 'none';
}

// Initialize and auto-refresh the dashboard
fetchDevices();
setInterval(fetchDevices, 5000); // Refresh every 5 seconds
