const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;

let windowSize = 10; // Configure window size
let windowNumbers = []; // Array to store the numbers

// Function to fetch numbers from the third-party API
const fetchNumbers = async (url) => {
    try {
        const response = await axios.get(url, { timeout: 500 }); // Set a 500ms timeout
        return response.data.numbers;
    } catch (error) {
        return []; // Return an empty array if the API request fails or times out
    }
};

// Function to check if a number is unique in the current window
const isUnique = (num) => !windowNumbers.includes(num);

// Function to update the window with new unique numbers
const updateWindow = (newNumbers) => {
    newNumbers.forEach((num) => {
        if (isUnique(num)) {
            if (windowNumbers.length >= windowSize) {
                windowNumbers.shift(); // Remove the oldest number if the window size is exceeded
            }
            windowNumbers.push(num); // Add the new unique number
        }
    });
};

// Function to calculate the average of the numbers in the window
const calculateAverage = () => {
    if (windowNumbers.length === 0) return 0;
    const sum = windowNumbers.reduce((acc, curr) => acc + curr, 0);
    return (sum / windowNumbers.length).toFixed(2);
};

// Route handler for the "numbers/:id" endpoint
app.get('/numbers/:id', async (req, res) => {
    const { id } = req.params;
    let apiUrl = '';

    // Determine the API URL based on the ID
    switch (id) {
        case 'p':
            apiUrl = 'http://20.244.56.144/test/primes';
            break;
        case 'f':
            apiUrl = 'http://20.244.56.144/test/fibonacci';
            break;
        case 'e':
            apiUrl = 'http://20.244.56.144/test/even';
            break;
        case 'r':
            apiUrl = 'http://20.244.56.144/test/random';
            break;
        default:
            return res.status(400).json({ error: 'Invalid ID' }); // Return error for invalid ID
    }

    // Store the previous state of the window
    const windowPrevState = [...windowNumbers];

    // Fetch new numbers from the third-party API
    const newNumbers = await fetchNumbers(apiUrl);

    // Update the window with new numbers
    updateWindow(newNumbers);

    // Store the current state of the window
    const windowCurrState = [...windowNumbers];

    // Calculate the average of the numbers in the window
    const average = calculateAverage();

    // Respond with the required data
    res.json({
        windowPrevState,
        windowCurrState,
        numbers: newNumbers,
        avg: average,
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
