function displayMaxCoord() {
    const bitLength = document.getElementById("bitLength").value;
    const dimension = document.getElementById("dimension").value;
    const maxCoord = document.getElementById("maxCoord");

    if (bitLength) {
        const maxCoordinate = (1 << (bitLength / dimension)) - 1;
        maxCoord.innerText = `Maximale Koordinate: ${maxCoordinate}`;
        maxCoord.classList.remove("hidden");
    } else {
        maxCoord.classList.add("hidden");
    }
}

function toggleCoordinateFields() {
    const dimension = document.getElementById('dimension').value;
    const layout = document.getElementById('layout');
    const zInput = document.getElementById('zInput');

    // Zeige oder verstecke die z-Koordinate basierend auf der Dimension
    if (dimension === '3') {
        zInput.classList.remove('hidden');
        layout.classList.remove('hidden'); // Zeige das Layout-Select-Feld
    } else {
        zInput.classList.add('hidden');
        layout.classList.add('hidden'); // Verstecke das Layout-Select-Feld
    }

    // Anpassen der Eingabereihenfolge basierend auf dem Layout
    updateCoordinateInputOrder(layout.value);
}

function updateCoordinateInputOrder(layout) {
    const xLabel = document.querySelector('label[for="x"]');
    const yLabel = document.querySelector('label[for="y"]');
    const zLabel = document.querySelector('label[for="z"]');
    const xInput = document.getElementById('x');
    const yInput = document.getElementById('y');
    const zInput = document.getElementById('zInput');

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
    } else if (layout === 'zyx') {
        coordinateInputs.appendChild(zLabel);
        coordinateInputs.appendChild(zInput);
        coordinateInputs.appendChild(yLabel);
        coordinateInputs.appendChild(yInput);
        coordinateInputs.appendChild(xLabel);
        coordinateInputs.appendChild(xInput);
    }
}


function calculateMortonCode() {
    const bitLength = parseInt(document.getElementById("bitLength").value);
    const dimension = document.getElementById("dimension").value;
    const layout = document.getElementById("layout").value;
    const x = parseInt(document.getElementById("x").value) || 0;
    const y = parseInt(document.getElementById("y").value) || 0;
    const z = dimension === "3" ? (parseInt(document.getElementById("z").value) || 0) : 0;

    let mortonCode = 0;

    if (dimension === "3") {
        const coords = layout === "xyz" ? [x, y, z] : [z, y, x];
        mortonCode = interleaveBits(coords, bitLength);
    } else {
        mortonCode = interleaveBits([x, y], bitLength);
    }

    const result = document.getElementById("result");
    result.innerHTML = `Morton-Code (Dezimal): ${mortonCode}<br>Morton-Code (Binär): ${mortonCode.toString(2)}`;
    result.classList.remove("hidden");
}

function interleaveBits(coords, bitLength) {
    let mortonCode = 0;
    const bitsPerCoordinate = bitLength / coords.length;

    for (let i = 0; i < bitsPerCoordinate; i++) {
        for (let j = 0; j < coords.length; j++) {
            mortonCode |= ((coords[j] >> i) & 1) << (i * coords.length + j);
        }
    }

    return mortonCode;
}
