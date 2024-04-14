document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('transferForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const recipient = document.getElementById('recipientName').value;
        const amount = document.getElementById('amount').value;
        const date = new Date().toLocaleDateString();

        // Append new transaction to the table
        const table = document.querySelector("table tbody");
        const row = table.insertRow();
        row.insertCell(0).textContent = date;
        row.insertCell(1).textContent = recipient;
        row.insertCell(2).textContent = `$${parseFloat(amount).toFixed(2)}`;

        // Clear form fields
        document.getElementById('recipientName').value = '';
        document.getElementById('amount').value = '';
    });
});
