document.addEventListener('DOMContentLoaded', () => {
    const licenseForm = document.getElementById('licenseForm');
    const recordsList = document.getElementById('recordsList');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const licenseIdInput = document.getElementById('licenseId');

    // 1. Fetch and Display All Records
    async function loadRecords() {
        try {
            const res = await fetch('/api/licenses');
            const data = await res.json();
            
            recordsList.innerHTML = '';
            if (!data || data.length === 0) {
                recordsList.innerHTML = '<p>No records found.</p>';
                return;
            }

            data.forEach(record => {
                const card = document.createElement('div');
                card.className = 'record-card';
                
                const expiry = record.expiryDate ? new Date(record.expiryDate).toLocaleDateString('en-IN') : 'N/A';
                
                let photosHTML = '';
                if (record.photos && record.photos.length > 0) {
                    record.photos.forEach(url => {
                        photosHTML += `<img src="${url}" class="record-img" alt="License Photo">`;
                    });
                }

                card.innerHTML = `
                    <h3>${record.name || 'N/A'}</h3>
                    <p><strong>Mobile:</strong> ${record.mobile || 'N/A'}</p>
                    <p><strong>Location:</strong> ${record.location || 'N/A'}</p>
                    <p><strong>Address:</strong> ${record.address || 'N/A'}</p>
                    <p><strong>Quantity:</strong> ${record.quantity || 0}</p>
                    <p><strong>Expiry Date:</strong> <span class="expiry-text">${expiry}</span></p>
                    <p><strong>Work Details:</strong> ${record.work || 'N/A'}</p>
                    <div class="img-gallery">${photosHTML}</div>
                    <div class="card-actions">
                        <button class="edit-btn" data-id="${record._id}">Edit</button>
                        <button class="delete-btn" data-id="${record._id}">Delete</button>
                    </div>
                `;
                recordsList.appendChild(card);
            });

            document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', deleteRecord));
            document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', startEdit));

        } catch (err) {
            console.error('Error loading data:', err);
        }
    }

    // 2. Submit Form (Create or Update)
    licenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = licenseIdInput.value;
        const formData = new FormData();
        
        formData.append('name', document.getElementById('name').value);
        formData.append('mobile', document.getElementById('mobile').value);
        formData.append('location', document.getElementById('location').value);
        formData.append('address', document.getElementById('address').value);
        formData.append('quantity', document.getElementById('quantity').value);
        formData.append('expiryDate', document.getElementById('expiryDate').value);
        formData.append('work', document.getElementById('work').value);

        const fileInput = document.getElementById('photos');
        if (fileInput && fileInput.files) {
            for (let i = 0; i < fileInput.files.length; i++) {
                formData.append('photos', fileInput.files[i]);
            }
        }

        let url = '/api/licenses';
        let method = 'POST';

        if (id) {
            url = `/api/licenses/${id}`;
            method = 'PUT';
        }

        try {
            submitBtn.innerText = "Saving...";
            submitBtn.disabled = true;

            const res = await fetch(url, { method: method, body: formData });
            const result = await res.json();
            
            if (result.success) {
                alert(id ? 'Record updated successfully!' : 'Record added successfully!');
                resetForm();
                await loadRecords();
            } else {
                alert('Error saving record: ' + result.error);
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            alert('Something went wrong. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = id ? "Update Record" : "Save Record";
        }
    });

    // 3. Populate Form for Editing
    async function startEdit(e) {
        const id = e.target.getAttribute('data-id');
        try {
            const res = await fetch('/api/licenses');
            const data = await res.json();
            const record = data.find(item => item._id === id);
            
            if (record) {
                licenseIdInput.value = record._id;
                document.getElementById('name').value = record.name || '';
                document.getElementById('mobile').value = record.mobile || '';
                document.getElementById('location').value = record.location || '';
                document.getElementById('address').value = record.address || '';
                document.getElementById('quantity').value = record.quantity || '';
                document.getElementById('work').value = record.work || '';
                
                if (record.expiryDate) {
                    const dateObj = new Date(record.expiryDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    document.getElementById('expiryDate').value = formattedDate;
                }

                formTitle.innerText = "Edit License Record";
                submitBtn.innerText = "Update Record";
                cancelBtn.style.display = "inline-block";
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) { console.error(err); }
    }

    // 4. Delete Record
    async function deleteRecord(e) {
        if (!confirm('Are you sure you want to delete this record?')) return;
        const id = e.target.getAttribute('data-id');
        try {
            const res = await fetch(`/api/licenses/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                loadRecords();
            } else { alert('Failed to delete'); }
        } catch (err) { console.error(err); }
    }

    function resetForm() {
        licenseForm.reset();
        licenseIdInput.value = '';
        formTitle.innerText = "Add New License Record";
        submitBtn.innerText = "Save Record";
        cancelBtn.style.display = "none";
    }

    cancelBtn.addEventListener('click', resetForm);

    // Initial Load
    loadRecords();
});