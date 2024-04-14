document.addEventListener('DOMContentLoaded', function() {
    fetchUserData(); 

    //logout button functionality
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', function() {
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Include credentials to handle session
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/login.html'; // Redirect to login page
            } else {
                alert('Failed to logout.');
            }
        })
        .catch(error => {
            console.error('Logout failed:', error);
            alert('Error logging out.');
        });
    });

    const updateProfileForm = document.getElementById('updateProfileForm');
    if (updateProfileForm) {
        updateProfileForm.addEventListener('submit', function(event) {
            event.preventDefault();
            updateUserDetails();
        });
    }
});

//function that fetches the user data like phone number, email, etc
function fetchUserData() {
    fetch('/api/user/details', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // Important for session handling
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('email').value = data.email;
        document.getElementById('phone').value = data.phone;
        document.getElementById('address').value = data.address;
    })
    .catch(error => {
        console.error('Failed to fetch user details:', error);
        alert('Failed to fetch user details.');
    });
}

//function that updates the user details based on whats in the form
function updateUserDetails() {
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;

    fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, address }),
        credentials: 'include' // Important for session handling
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Profile updated successfully!');
        } else {
            alert('Failed to update profile: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error updating user details:', error);
        alert('Failed to update profile.');
    });
}
