const fs = require('fs');

// Function to convert a given value in a specific base to base-10.
function convert_to_base_10(value, base) {
    return parseInt(value, base);
}

// Function to perform Lagrange Interpolation.
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

// Function to find the secret using Lagrange Interpolation.
function find_secret(data) {
    if (!data || !data.keys) {
        throw new Error("Invalid input data: Missing 'keys' object.");
    }

    const keys = data.keys;
    const n = keys.n;
    const k = keys.k;

    const x = [];
    const y = [];

    console.log("Processing Points:");
    for (let key in data) {
        if (key === 'keys') continue;

        const point = data[key];
        if (point && point.value && point.base) {
            const x_value = parseInt(key, 10);
            const y_value = convert_to_base_10(point.value, point.base);
            x.push(x_value);
            y.push(y_value);
            console.log(`x: ${x_value}, Base: ${point.base}, Original Value: ${point.value}, Decimal Value: ${y_value}`);
        }
    }

    if (x.length < k) {
        return { secret: null, wrongPoints: [] };
    }

    const secret = lagrange_interpolation(x.slice(0, k), y.slice(0, k), 0);

    const wrongPoints = [];
    console.log("\nValidating Remaining Points:");
    for (let i = k; i < x.length; i++) {
        const expectedY = lagrange_interpolation(x.slice(0, k), y.slice(0, k), x[i]);
        if (Math.ceil(expectedY) !== y[i]) {
            wrongPoints.push({
                index: x[i],
                originalValue: y[i],
                expectedValue: Math.ceil(expectedY),
            });
            console.log(`Faulty Point at x: ${x[i]}, Original Value: ${y[i]}, Expected Value: ${Math.ceil(expectedY)}`);
        }
    }

    return { secret, wrongPoints };
}

// Function to read the test cases from the JSON files.
function main() {
    try {
        // Read the test cases from JSON files.
        const testcase1 = JSON.parse(fs.readFileSync('input1.json', 'utf8'));
        const testcase2 = JSON.parse(fs.readFileSync('input2.json', 'utf8'));

        console.log("======================================");
        console.log("Test Case 1:");
        const result1 = find_secret(testcase1);
        console.log("Result:");
        console.log(`Secret: ${result1.secret}`);
        if (result1.wrongPoints.length > 0) {
            console.log("Faulty Points:");
            result1.wrongPoints.forEach(point =>
                console.log(`x: ${point.index}, Original Value: ${point.originalValue}, Expected Value: ${point.expectedValue}`)
            );
        } else {
            console.log("No Faulty Points.");
        }
        console.log("======================================\n");

        console.log("======================================");
        console.log("Test Case 2:");
        const result2 = find_secret(testcase2);
        console.log("Result:");
        console.log(`Secret: ${result2.secret}`);
        console.log(`\n`);
        if (result2.wrongPoints.length > 0) {
            console.log("Faulty Points:");
            result2.wrongPoints.forEach(point =>
                console.log(`x: ${point.index}, Original Value: ${point.originalValue}, Expected Value: ${point.expectedValue}`)
            );
        } else {
            console.log("No Faulty Points.");
        }
        console.log("======================================\n");

    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

// Run the main function.
main();
