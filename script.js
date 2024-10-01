const fs = require('fs');

function convert_to_base_10(value, base) {
    return parseInt(value, base); 
}


function lagrange_interpolation(x_points, y_points, k) {
    let result = 0;
    const length = x_points.length;

    for (let i = 0; i < length; i++) {
        let term = y_points[i];
        for (let j = 0; j < length; j++) {
            if (i !== j) {
                const denominator = x_points[i] - x_points[j];
                if (denominator === 0) {
                    throw new Error("Division by zero error in interpolation.");
                }
                term *= (k - x_points[j]) / denominator;
            }
        }
        result += term;
    }

    return result;
}

// Function to find the secret from the given data
function find_secret(data) {
    if (!data || !data.keys) {
        throw new Error("Invalid input data: Missing 'keys' object.");
    }

    const keys = data.keys;
    const n = keys.n;
    const k = keys.k;

    const x = [];
    const y = [];

    for (let key in data) {
        if (key === 'keys') {
            continue; 
        }

        const point = data[key];
        if (point && point.value && point.base) {
            x.push(parseInt(key, 10));
            y.push(convert_to_base_10(point.value, point.base));
            console.log(parseInt(key, 10),point.base, point.value,convert_to_base_10(point.value, point.base))
        }
    }

    if (x.length < k) {
        return { secret: null, wrongPoints: [] };
    }


    const secret = lagrange_interpolation(x.slice(0, k), y.slice(0, k), 0);

    // Find wrong points in the remaining data points
    const wrongPoints = [];
    for (let i = k; i < x.length; i++) {
        const expectedY = lagrange_interpolation(x.slice(0, k), y.slice(0, k), x[i]);
        if (Math.ceil(expectedY) !== y[i]) { // Use a tolerance for floating-point comparisons
            wrongPoints.push(x[i]);
        }
    }

    return { secret, wrongPoints };
}

// Function to read the test cases from the JSON files
function main() {
    try {
        const testcase1 = JSON.parse(fs.readFileSync('testcase1.json', 'utf8'));
        const testcase2 = JSON.parse(fs.readFileSync('testcase2.json', 'utf8'));

        const result1 = find_secret(testcase1);
        const result2 = find_secret(testcase2);

        console.log("Test case 1:");
        console.log(result1);
        console.log("Test case 2:");
        console.log(result2);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}


main();
