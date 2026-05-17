let isEditMode = false;

// Form Submit Setup (Save/Update)
document.getElementById('licenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const editId = document.getElementById('editId').value;
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('mobile', document.getElementById('mobile').value);
    formData.append('location', document.getElementById('location').value);
    formData.append('address', document.getElementById('address').value);
    formData.append('quantity', document.getElementById('quantity').value);
    formData.append('expiryDate', document.getElementById('expiryDate').value);

    const fileInput = document.getElementById('photos');
    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('photos', fileInput.files[i]);
    }

    let url = '/api/licenses';
    let method = 'POST';

    if (isEditMode && editId) {
        url = `/api/licenses/${editId}`;
        method = 'PUT';
    }

    try {
        const response = await fetch(url, { method: method, body: formData });
        if (response.ok) {
            alert(isEditMode ? 'Data successfully Update ho gaya!' : 'Naya record save ho gaya!');
            resetForm();
            loadLicenses();
        } else {
            alert('Kuch galti hui, please details check karein.');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
    }
});

// Database Se Records Laakar Screen Par Dikhana
async function loadLicenses() {
    try {
        const response = await fetch('/api/licenses');
        const data = await response.json();
        const listDiv = document.getElementById('licenseList');
        listDiv.innerHTML = '';

        const today = new Date();

        data.forEach(item => {
            const expDate = new Date(item.expiryDate);
            const dateStr = expDate.toLocaleDateString('en-IN');
            
            // Checking if expiry is within 30 days
            const timeDiff = expDate.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            const isNear = daysDiff <= 30 ? 'near-expiry' : '';

            let photosHTML = '';
            item.photos.forEach(imgUrl => {
                photosHTML += `<img src="${imgUrl}" alt="cylinder">`;
            });

            // Making Map link Clickable
            let mapLinkHTML = '<i>No Link Provided</i>';
            if (item.location && item.location.trim().startsWith('http')) {
                mapLinkHTML = `<a href="${item.location.trim()}" target="_blank" style="color: #007bff; font-weight: bold; text-decoration: none;">🗺️ Open in Google Maps</a>`;
            } else if (item.location && item.location.trim() !== "") {
                mapLinkHTML = item.location;
            }

            const card = document.createElement('div');
            card.className = `license-item ${isNear}`;
            card.innerHTML = `
                <h3>${item.name} ${isNear ? '⚠️ (Expiring Soon!)' : ''}</h3>
                <p><strong>📞 Mobile:</strong> ${item.mobile}</p>
                <p><strong>🏠 Address:</strong> ${item.address || 'N/A'}</p>
                <p><strong>📍 Map Link:</strong> ${mapLinkHTML}</p>
                <p><strong>🧯 Quantity:</strong> ${item.quantity} Cylinders</p>
                <p><strong>📅 Expiry Date:</strong> <span style="font-weight:bold; color:#dc3545;">${dateStr}</span></p>
                <div class="img-preview-container">${photosHTML}</div>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editLicense('${item._id}', '${item.name}', '${item.mobile}', '${item.location || ''}', '${item.address || ''}', ${item.quantity}, '${item.expiryDate.split('T')[0]}')">✏️ Edit</button>
                    <button class="btn-delete" onclick="deleteLicense('${item._id}')">🗑️ Delete</button>
                </div>
            `;
            listDiv.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading list:', error);
    }
}

// Edit Mode Par Data Form Me Load Karna
function editLicense(id, name, mobile, location, address, quantity, expiryDate) {
    isEditMode = true;
    document.getElementById('formTitle').innerText = "✏️ Edit License Details";
    document.getElementById('submitBtn').innerText = "Update Details";
    document.getElementById('cancelEditBtn').style.display = "block";
    document.getElementById('photoLabel').innerText = "Update Photos (Optional)";

    document.getElementById('editId').value = id;
    document.getElementById('name').value = name;
    document.getElementById('mobile').value = mobile;
    document.getElementById('location').value = location;
    document.getElementById('address').value = address;
    document.getElementById('quantity').value = quantity;
    document.getElementById('expiryDate').value = expiryDate;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Record Delete Karne Ke Liye
async function deleteLicense(id) {
    if (confirm('Kya aap pakka is record ko delete karna chahte hain?')) {
        try {
            const response = await fetch(`/api/licenses/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Record successfully delete ho gaya!');
                loadLicenses();
                if(isEditMode) resetForm();
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    }
}

// Form Ko Reset/Normal Mode Me Lana
function resetForm() {
    isEditMode = false;
    document.getElementById('licenseForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('formTitle').innerText = "Register New Cylinder/License";
    document.getElementById('submitBtn').innerText = "Save Details";
    document.getElementById('cancelEditBtn').style.display = "none";
    document.getElementById('photoLabel').innerText = "Upload Photos (2-3)";
}

document.getElementById('cancelEditBtn').addEventListener('click', resetForm);
window.onload = loadLicenses;