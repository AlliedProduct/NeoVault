const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const session = require('express-session');


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

app.use(bodyParser.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: 'abcdefg',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, 
        httpOnly: false,
        maxAge: 1000 * 60 * 60 * 24 
    }
}));

app.use((req, res, next) => {
    console.log(`Session ID: ${req.session.id}, User ID: ${req.session.userId}`);
    next();
});


// MySQL connection
const db = mysql.createConnection({
    host: '52.208.154.224',
    user: 'root',          
    password: 'Password123', 
    database: 'banking'     
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL Server:', err);
        throw err;
    }
    console.log('Connected to MySQL Server!');
});

// API routes

// fetches the username of the user
app.get('/api/username', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    db.query('SELECT username FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        if (results.length > 0) {
            res.json({ username: results[0].username });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    });
});


// User login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT id FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            res.status(500).send({ error: 'Failed to login' });
        } else if (results.length > 0) {
            req.session.userId = results[0].id; 
            req.session.save(err => {
                if(err) {
                    return res.status(500).json({ error: 'Failed to save session' });
                }
                res.json({ success: true, message: "Login successful", userId: results[0].id });
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    });
});

// User logout endpoint
app.post('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to destroy session' });
        }
        res.send({ success: true, message: 'Logged out successfully' });
    });
});

// User registration endpoint
app.get('/balance', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const query = 'SELECT balance FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) res.status(500).send({ error: 'Database query failed' });
        else res.send({ balance: results[0].balance });
    });
});

//
app.get('/transactions', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    const query = 'SELECT transaction_date, description, amount FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC';
    db.query(query, [userId], (err, results) => { // Replace 'userId' with the actual user's ID
        if (err) {
            console.error("Database error:", err);
            res.status(500).send({ error: 'Failed to fetch transactions' });
            return;
        }
        res.json(results);
    });
});

// Endpoint to fetch the last 10 transactions
app.get('/api/transactions', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const query = 'SELECT transaction_date, description, amount FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC LIMIT 10';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            res.status(500).send({ error: 'Failed to fetch transactions' });
            return;
        }
        res.json(results);
    });
});

// Endpoint to handle balance top-up
app.post('/api/transfer', (req, res) => {
    const { recipientUsername, amount } = req.body;
    const senderId = req.session.userId;
    if (amount <= 0) {
        return res.status(400).json({ error: "Invalid amount. Please enter a positive number." });
    }

    db.beginTransaction(err => {
        if (err) {
            console.error('Failed to start transaction:', err);
            return res.status(500).json({ error: "Failed to start transaction" });
        }

        const checkBalanceQuery = 'SELECT balance FROM users WHERE id = ?';
        db.query(checkBalanceQuery, [senderId], (err, results) => {
            if (err || results.length === 0) {
                console.error('Balance check failed:', err);
                db.rollback();
                return res.status(500).json({ error: "Failed to retrieve sender balance" });
            }

            const senderBalance = results[0].balance;
            if (senderBalance < amount) {
                db.rollback();
                return res.status(400).json({ error: "Insufficient funds" });
            }

            // Take amount from the sender
            const deductBalanceQuery = 'UPDATE users SET balance = balance - ? WHERE id = ?';
            db.query(deductBalanceQuery, [amount, senderId], (err, result) => {
                if (err || result.affectedRows === 0) {
                    console.error('Failed to deduct amount:', err);
                    db.rollback();
                    return res.status(500).json({ error: "Failed to deduct amount from sender" });
                }

                // Add amount to recipient
                const addBalanceQuery = 'UPDATE users SET balance = balance + ? WHERE username = ?';
                db.query(addBalanceQuery, [amount, recipientUsername], (err, result) => {
                    if (err || result.affectedRows === 0) {
                        console.error('Failed to add amount to recipient:', err);
                        db.rollback();
                        return res.status(500).json({ error: "Failed to add amount to recipient" });
                    }

                    // Insert transaction record for the sender
                    const insertSenderTransaction = 'INSERT INTO transactions (user_id, amount, description) VALUES (?, ?, ?)';
                    const senderDescription = `Transfer of $${amount} to ${recipientUsername}`;
                    db.query(insertSenderTransaction, [senderId, -amount, senderDescription], (err, result) => {
                        if (err) {
                            console.error('Failed to log sender transaction:', err);
                            db.rollback();
                            return res.status(500).json({ error: "Failed to log sender transaction" });
                        }

                        // Insert transaction record for the recipient
                        const insertRecipientTransaction = 'INSERT INTO transactions (user_id, amount, description) VALUES ((SELECT id FROM users WHERE username = ?), ?, ?)';
                        const recipientDescription = `Received $${amount} from user ID ${senderId}`;
                        db.query(insertRecipientTransaction, [recipientUsername, amount, recipientDescription], (err, result) => {
                            if (err) {
                                console.error('Failed to log recipient transaction:', err);
                                db.rollback();
                                return res.status(500).json({ error: "Failed to log recipient transaction" });
                            }

                            db.commit(err => {
                                if (err) {
                                    console.error('Failed to commit transaction:', err);
                                    db.rollback();
                                    return res.status(500).json({ error: "Failed to commit transaction" });
                                }
                                res.json({ success: true, message: "Transfer completed successfully" });
                            });
                        });
                    });
                });
            });
        });
    });
});



// Endpoint to handle balance top-up
app.post('/api/topup', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const { amount } = req.body;

    if (amount <= 0) {
        return res.status(400).json({ error: "Invalid amount. Please enter a positive number." });
    }

    db.beginTransaction(err => {
        if (err) {
            console.error('Transaction start failed:', err);
            return res.status(500).json({ error: "Transaction start failed" });
        }

        // Updates the user balance
        const updateBalanceQuery = 'UPDATE users SET balance = balance + ? WHERE id = ?';
        db.query(updateBalanceQuery, [amount, userId], (error, results) => {
            if (error || results.affectedRows === 0) {
                db.rollback(() => {
                    console.error('Failed to update balance:', error);
                    res.status(500).json({ error: "Failed to update balance" });
                });
                return;
            }

            // Logs the transaction
            const logTransactionQuery = 'INSERT INTO transactions (user_id, amount, transaction_date, description) VALUES (?, ?, NOW(), ?)';
            const transactionDescription = amount >= 0 ? "User topped up" : "Other transaction description";  // Adjust based on logic
            db.query(logTransactionQuery, [userId, amount, transactionDescription], (error, results) => {

                if (error) {
                    db.rollback(() => {
                        console.error('Failed to log transaction:', error);
                        res.status(500).json({ error: "Failed to log transaction" });
                    });
                    return;
                }

                db.commit(err => {
                    if (err) {
                        db.rollback(() => {
                            console.error('Transaction commit failed:', err);
                            res.status(500).json({ error: "Transaction commit failed" });
                        });
                        return;
                    }

                    // Fetch the updated balance and the recent transactions to send back
                    db.query('SELECT balance FROM users WHERE id = ?', [userId], (err, balanceResults) => {
                        if (err || balanceResults.length === 0) {
                            console.error('Failed to fetch updated balance:', err);
                            res.status(500).json({ error: "Failed to fetch updated balance" });
                            return;
                        }

                        // Fetch the recent transactions
                        db.query('SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC LIMIT 10', [userId], (err, transactionResults) => {
                            if (err) {
                                console.error('Failed to fetch transactions:', err);
                                res.status(500).json({ error: "Failed to fetch transactions" });
                                return;
                            }

                            res.json({
                                success: true,
                                message: "Balance updated successfully",
                                balance: balanceResults[0].balance,
                                transactions: transactionResults
                            });
                        });
                    });
                });
            });
        });
    });
});

// Endpoint to fetch current savings and goal
app.get('/api/savings', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if there is an existing entry and create one if thers not
    db.query('SELECT amount, goal FROM savings WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Failed to fetch savings", details: err.message });
        }
        if (results.length === 0) {
                // If no savings record exists, make one with 0,0
            db.query('INSERT INTO savings (user_id, amount, goal) VALUES (?, 0, 0)', [userId], (err, result) => {
                if (err || result.affectedRows === 0) {
                    return res.status(500).json({ error: "Failed to create default savings record" });
                }
                res.json({ amount: 0, goal: 0 });
            });
        } else {
            res.json(results[0]);
        }
    });
});

// Endpoint to add savings
app.post('/api/savings/add', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const { amount } = req.body;
    if (amount <= 0) {
        return res.status(400).json({ error: "Invalid amount. Please enter a positive number." });
    }

    db.beginTransaction(err => {
        if (err) {
            console.error('Failed to start transaction:', err);
            return res.status(500).json({ error: "Transaction start failed" });
        }

        db.query('SELECT amount FROM savings WHERE user_id = ?', [userId], (err, results) => {
            if (err) {
                db.rollback();
                return res.status(500).json({ error: "Failed to check savings" });
            }

            if (results.length === 0) {
                db.query('INSERT INTO savings (user_id, amount, goal) VALUES (?, 0, 0)', [userId], (err, result) => {
                    if (err || result.affectedRows === 0) {
                        db.rollback();
                        return res.status(500).json({ error: "Failed to create savings record" });
                    }
                    addToSavings(userId, amount, db, res);
                });
            } else {
                addToSavings(userId, amount, db, res);
            }
        });
    });
});



// Function to add an amount to savings
function addToSavings(userId, amount, db, res) {
    // Deduct amount from user balance
    db.query('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, userId], (err, result) => {
        if (err || result.affectedRows === 0) {
            db.rollback();
            return res.status(500).json({ error: "Failed to deduct amount from balance" });
        }

        // Add amount to savings
        db.query('UPDATE savings SET amount = amount + ? WHERE user_id = ?', [amount, userId], (err, result) => {
            if (err || result.affectedRows === 0) {
                db.rollback();
                return res.status(500).json({ error: "Failed to add to savings" });
            }

            // Logs the transaction
            db.query('INSERT INTO transactions (user_id, amount, description, transaction_date) VALUES (?, ?, "Deducted for savings addition", NOW())', [userId, -amount], (err, result) => {
                if (err) {
                    db.rollback();
                    return res.status(500).json({ error: "Failed to log transaction for deduction" });
                }

                db.commit(err => {
                    if (err) {
                        db.rollback();
                        return res.status(500).json({ error: "Failed to commit transactions" });
                    }
                    res.json({ success: true, message: "Amount added to savings successfully" });
                });
            });
        });
    });
}

// Endpoint to set or update savings goal
app.post('/api/savings/set-goal', (req, res) => {
    const userId = req.session.userId; 
    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const { goal } = req.body;
    if (goal <= 0) {
        return res.status(400).json({ error: "Invalid goal amount" });
    }
    db.query('UPDATE savings SET goal = ? WHERE user_id = ?', [goal, userId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Failed to set savings goal" });
        }
        res.json({ success: true, message: "Savings goal set successfully" });
    });
});

// Fetches user details
app.get('/api/user/details', (req, res) => {
    const userId = req.session.userId; 
    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    db.query('SELECT email, phone, address FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Failed to fetch user details' });
        } else {
            res.json(results[0]);
        }
    });
});

// Endpoint that updates user details
app.post('/api/user/update', (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
        const { email, phone, address } = req.body;
    db.query('UPDATE users SET email = ?, phone = ?, address = ? WHERE id = ?',
        [email, phone, address, userId], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                res.status(500).json({ error: 'Failed to update user details' });
            } else {
                res.json({ success: true, message: 'User details updated successfully' });
            }
        });
});

//Endpoint that gets personal details of the user
app.get('/api/user/details', (req, res) => {
    const userId = req.session.userId; 
    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const query = 'SELECT email, phone, address FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user details:', err);
            res.status(500).json({ error: "Database error occurred while fetching user details" });
        } else if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });
});

// Endpoint to update user details
app.post('/api/user/update', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const { email, phone, address } = req.body;
    if (!email || !phone || !address) {
        return res.status(400).json({ error: "All fields are required" });
    }
    const query = 'UPDATE users SET email = ?, phone = ?, address = ? WHERE id = ?';
    db.query(query, [email, phone, address, userId], (err, result) => {
        if (err) {
            console.error('Error updating user details:', err);
            res.status(500).json({ error: "Database error occurred while updating user details" });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: "User not found or data not changed" });
        } else {
            res.json({ success: true, message: "User details updated successfully" });
        }
    });
});

// Endpoint for user registration
app.post('/api/register', (req, res) => {
    const { username, password, email, phone, address } = req.body;
    const query = 'INSERT INTO users (username, password, email, phone, address) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [username, password, email, phone, address], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            res.status(500).send({ error: 'Failed to register user' });
        } else {
            res.json({ success: true, message: "Registration successful", userId: result.insertId });
        }
    });
});

// getting errors, using this to test and see whats going on lmk if you need me to remove
app.get('/test-database', (req, res) => {
    const userId = req.session.userId;
    console.log("UserID:", userId);  // Check if userId is retrieved correctly
    const sql = 'SELECT * FROM users WHERE user_id = ?';
    console.log("Executing query:", sql, "with userId:", userId);
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database query failed', details: err.message });
        }
        res.json(results);
    });
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});