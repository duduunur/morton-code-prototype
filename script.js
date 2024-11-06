function displayMaxCoord() {
    const bitLength = BigInt(document.getElementById("bitLength").value);
    const dimension = BigInt(document.getElementById("dimension").value);
    const maxCoord = document.getElementById("maxCoord");

    if (bitLength) {
        const maxCoordinate = (1n << (bitLength / dimension)) - 1n;
        maxCoord.innerText = `Maximum Coordinate Value (Decimal): ${maxCoordinate.toString()}`;
        maxCoord.classList.remove("hidden");
    } else {
        maxCoord.classList.add("hidden");
    }
}

function toggleCoordinateFields() {
    const dimension = document.getElementById('dimension').value;
    const layout = document.getElementById('layout');
    const layoutLabel = document.getElementById('layoutLabel');
    const zInput = document.getElementById('zInput');
    const zLabel = document.getElementById('zLabel');

    clearCoordinateInputs();

    // Zeige oder verstecke die z-Koordinate basierend auf der Dimension
    if (dimension === '3') {
        zLabel.classList.remove('hidden');
        zInput.classList.remove('hidden');
        layoutLabel.classList.remove('hidden');
        layout.classList.remove('hidden'); // Zeige das Layout-Select-Feld
    } else {
        layout.value = 'xyz';
        zLabel.classList.add('hidden');
        zInput.classList.add('hidden');
        layoutLabel.classList.add('hidden');
        layout.classList.add('hidden'); // Verstecke das Layout-Select-Feld
    }

    // Anpassen der Eingabereihenfolge basierend auf dem Layout
    updateCoordinateInputOrder(layout.value);
}

function clearCoordinateInputs() {
    document.getElementById("x").value = "";
    document.getElementById("y").value = "";
    
    // Prüfen, ob das z-Eingabefeld sichtbar ist, und es dann auch leeren
    const zInput = document.getElementById("z");
    if (zInput) {
        zInput.value = "";
    }
}

function updateCoordinateInputOrder(layout) {
    const xLabel = document.querySelector('label[for="x"]');
    const yLabel = document.querySelector('label[for="y"]');
    const zLabel = document.querySelector('label[for="z"]');
    const xInput = document.getElementById('x');
    const yInput = document.getElementById('y');
    const zInput = document.getElementById('zInput');
    const calculateButton = document.getElementById('calculateButton');

    // Entferne alle Koordinaten-Labels und Eingabefelder
    const coordinateInputs = document.getElementById('coordinateInputs');
    coordinateInputs.innerHTML = '';

    if (layout === 'xyz') {
        coordinateInputs.appendChild(xLabel);
        coordinateInputs.appendChild(xInput);
        coordinateInputs.appendChild(yLabel);
        coordinateInputs.appendChild(yInput);
        coordinateInputs.appendChild(zLabel);
        coordinateInputs.appendChild(zInput);
        coordinateInputs.appendChild(calculateButton);
    } else if (layout === 'zyx') {
        coordinateInputs.appendChild(zLabel);
        coordinateInputs.appendChild(zInput);
        coordinateInputs.appendChild(yLabel);
        coordinateInputs.appendChild(yInput);
        coordinateInputs.appendChild(xLabel);
        coordinateInputs.appendChild(xInput);
        coordinateInputs.appendChild(calculateButton);
    }
}


function calculateMortonCode() {
    const bitLength = parseInt(document.getElementById("bitLength").value);
    const dimension = document.getElementById("dimension").value;
    const layout = document.getElementById("layout").value;
    const x = parseInt(document.getElementById("x").value) || 0;
    const y = parseInt(document.getElementById("y").value) || 0;
    const z = dimension === "3" ? (parseInt(document.getElementById("z").value) || 0) : 0;

    let mortonCode1 = 0; // first method: interleave
    let mortonCode2 = 0; // second method: magic bits

    if (dimension === "3") {
        const coords = layout === "xyz" ? [x, y, z] : [z, y, x];
        mortonCode1 = interleaveBits(coords, bitLength);
        mortonCode2 = mortonEncodeMagicBits(coords);
        displayBinaryCoordinates(coords, bitLength)
        animateInterleaveSteps(coords, bitLength);
    } else {
        mortonCode1 = interleaveBits([x, y], bitLength);
        mortonCode2 = mortonEncodeMagicBits2D(x,y);
    }

    const result1 = document.getElementById("result1");
    const result2 = document.getElementById("result2");
    result1.innerHTML = `Interleave(for-loop):<br> Morton-Code (Dezimal): ${mortonCode1}<br>Morton-Code (Binär): ${mortonCode1.toString(2)}`;
    result2.innerHTML = `Magic Bits:<br>Morton-Code (Dezimal): ${mortonCode2}<br>Morton-Code (Binär): ${mortonCode2.toString(2)}`;
    result1.classList.remove("hidden");
    result2.classList.remove("hidden");
}

function interleaveBits(coords, bitLength) {
    let mortonCode = BigInt(0);
    const maxBits = bitLength / coords.length;

    for (let i = 0; i < maxBits; ++i) {
        for (let j = 0; j < coords.length; ++j) {
            mortonCode |= ((BigInt(coords[j]) & (BigInt(1) << BigInt(i))) << BigInt(i * (coords.length - 1) + j));
        }
    }
    return mortonCode;
}

function splitBy3(a) {
    let x = BigInt(a) & 0x1fffffn; // Nur die ersten 21 Bits verwenden und als BigInt speichern
    x = (x | (x << 32n)) & 0x1f00000000ffffn;
    x = (x | (x << 16n)) & 0x1f0000ff0000ffn;
    x = (x | (x << 8n)) & 0x100f00f00f00f00fn;
    x = (x | (x << 4n)) & 0x10c30c30c30c30c3n;
    x = (x | (x << 2n)) & 0x1249249249249249n;
    return x;
  }
  
  function mortonEncodeMagicBits(coords) {
    // Umwandlung in BigInt und Zerstreuung der Bits für x, y und z
    const result = splitBy3(coords[0]) | (splitBy3(coords[1]) << 1n) | (splitBy3(coords[2]) << 2n);
    return result;
  }

function splitBy2(a) {
    let x = BigInt(a) & 0xffffffffn; // Nur die ersten 32 Bits verwenden und als BigInt speichern
    x = (x | (x << 16n)) & 0x0000ffff0000ffffn;
    x = (x | (x << 8n)) & 0x00ff00ff00ff00ffn;
    x = (x | (x << 4n)) & 0x0f0f0f0f0f0f0f0fn;
    x = (x | (x << 2n)) & 0x3333333333333333n;
    x = (x | (x << 1n)) & 0x5555555555555555n;
    return x;
}

function mortonEncodeMagicBits2D(x, y) {
    // Umwandlung in BigInt und Zerstreuung der Bits für x und y
    const result = splitBy2(x) | (splitBy2(y) << 1n);
    return result;
}

function animateInterleaveSteps(coords, bitLength) {
    const stepsContainer = document.getElementById('interleaveSteps');
    stepsContainer.innerHTML = ''; // Reset container

    let mortonCode = BigInt(0);
    const maxBits = bitLength / coords.length;
    const colors = ['color-x', 'color-y', 'color-z'];

    for (let i = 0; i < maxBits; ++i) {
        for (let j = 0; j < coords.length; ++j) {
            let bitValue = (BigInt(coords[j]) & (BigInt(1) << BigInt(i)));
            let shiftedValue = bitValue << BigInt(i * (coords.length - 1) + j);
            mortonCode |= shiftedValue;

            // Animation: Bit-Schritt anzeigen
            setTimeout(() => {
                const bitElement = document.createElement('span');
                bitElement.classList.add('step-bit', colors[j]);
                bitElement.textContent = ((shiftedValue > 0n) ? '1' : '0');
                stepsContainer.appendChild(bitElement);
            }, 500 * (i * coords.length + j)); // Timing für schrittweise Animation
        }
    }
}

function displayBinaryCoordinates(coords, bitLength) {
    const binaryContainer = document.getElementById('binaryCoordinates');
    binaryContainer.innerHTML = ''; // Reset container
    const maxBits = bitLength / coords.length;

    const colors = ['color-x', 'color-y', 'color-z'];

    coords.forEach((coord, index) => {
        const binaryString = coord.toString(2).padStart(maxBits, '0'); // Annahme: 16 Bits für Anzeige

        // Jedes Bit farbig darstellen
        for (let i = 0; i < maxBits; i++) {
            const bitElement = document.createElement('span');
            bitElement.classList.add(colors[index]);
            bitElement.textContent = binaryString[i];
            binaryContainer.appendChild(bitElement);
        }

        // Abstand zwischen den Binärzahlen
        const spaceElement = document.createElement('span');
        spaceElement.textContent = ' ';
        binaryContainer.appendChild(spaceElement);
    });
}