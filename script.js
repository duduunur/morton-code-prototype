function toggleCoordinateFields() {
    const dimension = document.getElementById("dimension").value;
    const zInput = document.getElementById("zInput");
    zInput.classList.toggle("hidden", dimension === "2");
}

function displayMaxCoord() {
    const bitLength = parseInt(document.getElementById("bitLength").value);
    const dimension = parseInt(document.getElementById("dimension").value);

    // Berechnung der maximalen Koordinate pro Achse
    const bitsPerCoord = Math.floor(bitLength / dimension);
    const maxCoord = (1 << bitsPerCoord) - 1;

    const maxCoordDiv = document.getElementById("maxCoord");
    maxCoordDiv.innerHTML = `Maximale Koordinate pro Achse (Dezimal): ${maxCoord}`;
    maxCoordDiv.classList.remove("hidden");
}

function calculateMortonCode() {
    const bitLength = parseInt(document.getElementById("bitLength").value);
    const dimension = parseInt(document.getElementById("dimension").value);
    const x = parseInt(document.getElementById("x").value);
    const y = parseInt(document.getElementById("y").value);
    const z = dimension === 3 ? parseInt(document.getElementById("z").value) : 0;

    // Calculate max coord based on bit length and dimension
    const bitsPerCoord = Math.floor(bitLength / dimension);
    const maxCoord = (1 << bitsPerCoord) - 1;
    
    if (x > maxCoord || y > maxCoord || (dimension === 3 && z > maxCoord)) {
        alert("Koordinatenwerte überschreiten die maximale erlaubte Koordinate für die gewählte Bitlänge und Dimension.");
        return;
    }

    let mortonCode = 0;
    for (let i = 0; i < bitsPerCoord; i++) {
        mortonCode |= ((x >> i) & 1) << (i * dimension);
        mortonCode |= ((y >> i) & 1) << (i * dimension + 1);
        if (dimension === 3) {
            mortonCode |= ((z >> i) & 1) << (i * dimension + 2);
        }
    }

    // Convert Morton code to binary and pad with leading zeros based on bit length
    const binaryMortonCode = mortonCode.toString(2).padStart(bitLength, '0');

    // Display the result
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `Morton-Code (Dezimal): ${mortonCode}<br>Morton-Code (Binär): ${binaryMortonCode}`;
    resultDiv.classList.remove("hidden");
}
