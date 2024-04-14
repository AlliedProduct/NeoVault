document.addEventListener('DOMContentLoaded', function() {
    // checks if certain elements exist in the page and if they do it runs the functions
    if (document.getElementById('myChart')) {
        initializeChart();
        fetchTransactions();
    }

    if (document.getElementById('balance')) {
        fetchBalance();
    }

    if (document.getElementById('currentSavings')) {
        fetchSavings();
    }

    fetchUsername();

    const logoutButton = document.getElementById('logoutButton');

    //logout button 
    logoutButton.addEventListener('click', function() {
        fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/login.html';
            } else {
                alert('Failed to logout.');
            }
        })
        .catch(error => {
            console.error('Logout failed:', error);
            alert('Error logging out.');
        });
    });

    //form listeners
    const topUpForm = document.getElementById('topUpForm');
    if (topUpForm) {
        topUpForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const amount = parseFloat(document.getElementById('topUpAmount').value);
            if (!isNaN(amount) && amount > 0) {
                topUpBalance(amount);
            } else {
                displayErrorMessage('Please enter a valid amount greater than 0.');
            }
        });
    }

    const savingsForm = document.getElementById('savingsForm');
    if (savingsForm) {
        savingsForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const amount = parseFloat(document.getElementById('savingsAmount').value);
            if (!isNaN(amount) && amount > 0) {
                addSavings(amount);
            } else {
                alert('Please enter a valid amount');
            }
        });
    }

    const goalForm = document.getElementById('goalForm');
    if (goalForm) {
        goalForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const goal = parseFloat(document.getElementById('goalAmount').value);
            if (!isNaN(goal) && goal > 0) {
                setGoal(goal);
            } else {
                alert('Please enter a valid goal amount.');
            }
        });
    }

    const transferForm = document.getElementById('transferForm');
    if (transferForm) {
        transferForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const recipientUsername = document.getElementById('recipientName').value;
            const amount = parseFloat(document.getElementById('amount').value);
            if (!isNaN(amount) && amount > 0) {
                transferFunds(recipientUsername, amount);
            } else {
                displayErrorMessage('Please enter a valid amount greater than 0.');
            }
        });
    }
});

//function that fetches the username
function fetchUsername() {
    fetch('/api/username', {
        credentials: 'include' // Important for sessions to work
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch username');
        }
    })
    .then(data => {
        if (data.username) {
            document.getElementById('userProfileName').textContent = data.username;
        } else {
            console.error('Username not found in data');
        }
    })
    .catch(error => {
        console.error('Error fetching username:', error);
    });
}

//function that initializes the chart
function initializeChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Transaction Amounts',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

//function that updates the chart
function updateChart(transactions) {
    if (!myChart) return;
    myChart.data.labels = transactions.map(t => new Date(t.transaction_date).toLocaleDateString());
    myChart.data.datasets[0].data = transactions.map(t => t.amount);
    myChart.update();
}

//function that updates the transaction table
function updateTransactionTable(transactions) {
    const tableBody = document.getElementById('transactionsTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    transactions.forEach(transaction => {
        const row = tableBody.insertRow();
        const description = transaction.description ? transaction.description : 'No description';
        row.innerHTML = `
            <td>${new Date(transaction.transaction_date).toLocaleDateString()}</td>
            <td>${description}</td>
            <td>$${parseFloat(transaction.amount).toFixed(2)}</td>
        `;
    });
}

//function that tops up the balance
function topUpBalance(amount) {
    fetch('/api/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('balance').textContent = `$${parseFloat(data.balance).toFixed(2)}`;
            updateTransactionTable(data.transactions);
            updateChart(data.transactions);
            displaySuccessMessage(data.message);
        } else {
            displayErrorMessage(data.error);
        }
    })
    .catch(error => {
        console.error('Error processing top-up:', error);
        displayErrorMessage('Failed to process top-up.');
    });
}

//function that transfers funds
function transferFunds(recipientUsername, amount) {
    fetch('/api/transfer', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({recipientUsername, amount}),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displaySuccessMessage('Transfer successful: ' + data.message);
            fetchTransactions();
            fetchBalance();
        } else {
            displayErrorMessage('Transfer failed: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error processing transfer:', error);
        displayErrorMessage('Failed to process transfer.');
    });
}

//function that fetches the balance
function fetchBalance() {
    fetch('/balance', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.balance !== undefined) {
            document.getElementById('balance').textContent = `$${parseFloat(data.balance).toFixed(2)}`;
        }
    })
    .catch(error => {
        console.error('Error fetching balance:', error);
        displayErrorMessage('Error fetching balance');
    });
}

//function that fetches the transactions
function fetchTransactions() {
    fetch('/api/transactions', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.length) {
            updateChart(data);
            updateTransactionTable(data);
        }
    })
    .catch(error => console.error('Failed to fetch transactions:', error));
}

//function that sets the goal
function setGoal(goal) {
    fetch('/api/savings/set-goal', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ goal }),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displaySuccessMessage('Goal set successfully');
            fetchSavings();
        } else {
            alert(data.error);
        }
    })
    .catch(error => console.error('Error setting goal:', error));
}

//function that adds savings
function addSavings(amount) {
    fetch('/api/savings/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ amount }),
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displaySuccessMessage('Savings added successfully');
            fetchSavings();
            fetchTransactions();
            fetchBalance();
        } else {
            displayErrorMessage('Failed to add savings: ' + data.error); 
        }
    })
    .catch(error => {
        console.error('Error adding savings:', error);
        displayErrorMessage('Failed to add savings: ' + error.message); 
    });
}

//function that fetches the savings
function fetchSavings() {
    fetch('/api/savings', {
        method: 'GET',
        credentials: 'include', 
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.amount !== undefined && data.goal !== undefined) {
            document.getElementById('currentSavings').textContent = `$${data.amount.toFixed(2)}`;
            document.getElementById('savingsGoal').textContent = `$${data.goal.toFixed(2)}`;
            updateProgressBar(data.amount, data.goal);
        } else {
            console.error('No savings data returned:', data);
        }
    })
    .catch(error => {
        console.error('Error fetching savings:', error);
    });
}

//function that updates the progress bar
function updateProgressBar(current, goal) {
    const progressBar = document.getElementById('savingsProgress');
    if (goal > 0) {
        const progress = (current / goal) * 100;
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${progress.toFixed(2)}%`;
    } else {
        progressBar.style.width = '0%';
        progressBar.textContent = 'No goal set';
    }
}

//success and error messages
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
