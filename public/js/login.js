document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    loginUser(username, password);
});

document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    registerUser(username, password, email, phone, address);
});
//function that logs in the user
function loginUser(username, password) {
    fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/index.html'; //
        } else {
            displayErrorMessage('Login failed. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error logging in:', error);
        displayErrorMessage('Login failed. Please try again.');
    });
}
//function that registers the user
function registerUser(username, password, email, phone, address) {
    fetch('/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password, email, phone, address })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displaySuccessMessage('Registration successful!');
            window.location.href = '/login.html';
        } else {
            displayErrorMessage('Registration Failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error registering:', error);
        alert('Registration failed.');
    });
}
//function that shows the registration form
function showRegistrationForm() {
    var form = document.getElementById('registrationForm');
    var heading = document.getElementById('registerHeading');
    if (form.style.display === 'block') {
        form.style.display = 'none';
        heading.style.display = 'none';
    } else {
        form.style.display = 'block';
        heading.style.display = 'block';
    }
}
//function that displays the success and error messages
function displaySuccessMessage(message) {
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.className = 'alert alert-success';
        setTimeout(() => messageBox.textContent = '', 3000);
    }
}

function displayErrorMessage(message) {
    const messageBox = document.getElementById('messageBox');
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.className = 'alert alert-danger';
        setTimeout(() => messageBox.textContent = '', 3000);
    }
}
