// Maximalen Koordinatenwert ausrechnen und darstellen 
function displayMaxCoord() {
    const bitLength = BigInt(document.getElementById("bitLength").value);
    const dimension = BigInt(document.getElementById("dimension").value);
    //maxCoord verweist auf das HTML-Element, in dem das Ergebnis angezeigt wird
    const maxCoord = document.getElementById("maxCoord");

    const maxCoordinate = (1n << (bitLength / dimension)) - 1n; //1n << x verschiebt die Zahl 1 um x Bit nach links, was äquivalent zu 2^x ist 
    maxCoord.innerText = `Maximum Coordinate Value: ${maxCoordinate.toString()}`;
}

function toggleCoordinateFields() {
    const dimension = document.getElementById('dimension').value;
    const layout = document.getElementById('layout');
    const zInput = document.getElementById('zInput');
    const zLabel = document.getElementById('zLabel');

    clearCoordinateInputs();

    if (dimension === '3') {
        zLabel.classList.remove('hidden');
        zInput.classList.remove('hidden');
        layout.disabled = false; // Ermöglicht Auswahl von Layouts
    } else {
        layout.disabled = true; // Sperrt Auswahlfeld
        zLabel.classList.add('hidden');
        zInput.classList.add('hidden');
    }

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

function updateCoordinateLabels(dimension, layout) {
    const coordinateLabels = document.getElementById("coordinateLabels");
    //const zLabel = document.getElementById("zLabel");

    // Setze die Labels basierend auf Dimension und Layout
    if (dimension === "3") {
        if (layout === "xyz") {
            coordinateLabels.innerHTML = "x:<br>y:<br>z:<br>morton-code:";
        } else if (layout === "zyx") {
            coordinateLabels.innerHTML = "z:<br>y:<br>x:<br>morton-code:";
        }
    } else { // 2D
        coordinateLabels.innerHTML = "x:<br>y:<br>morton-code:";
    }
}

// Event Listener um die Coordinateneingabe zu aktualisieren
document.getElementById("dimension").addEventListener("change", (e) => {
    const dimension = e.target.value;
    const layout = document.getElementById("layout").value;
    updateCoordinateLabels(dimension, layout);
});

document.getElementById("layout").addEventListener("change", (e) => {
    const dimension = document.getElementById("dimension").value;
    const layout = e.target.value;
    updateCoordinateLabels(dimension, layout);
});


function calculateMortonCode() {
    // Sperre die Felder und den Button
     disableInputs();

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
        // interleave for-loop
        mortonCode1 = interleaveBits(coords, bitLength);

        // interleave Magic Bits 
        mortonCode2 = displayMortonEncoding(coords)

        // animation 
        displayBinaryCoordinates(coords, bitLength);
        animateInterleaveSteps(coords, bitLength, enableInputs);
    } else {
        displayBinaryCoordinates([x, y], bitLength);
        animateInterleaveSteps([x, y], bitLength, enableInputs);
         // interleave for-loop
        mortonCode1 = interleaveBits([x, y], bitLength);

         // interleave Magic Bits 
        mortonCode2 = displayMortonEncoding([x, y])
    }

    const result1 = document.getElementById("result1");
    const result2 = document.getElementById("result2");
    //result1.innerHTML = `Interleave(for-loop):<br> Morton-Code (Dezimal): ${mortonCode1}<br>Morton-Code (Binär): ${mortonCode1.toString(2)}`;
    //result2.innerHTML = `Magic Bits:<br>Morton-Code (Dezimal): ${mortonCode2}<br>Morton-Code (Binär): ${mortonCode2.toString(2)}`;
    result1.classList.remove("hidden");
    result2.classList.remove("hidden");
}

// Hilfsfunktion zum Sperren der Eingabefelder
function disableInputs() {
    document.getElementById('bitLength').disabled = true;
    document.getElementById('dimension').disabled = true;
    document.getElementById('layout').disabled = true;
    document.getElementById('x').disabled = true;
    document.getElementById('y').disabled = true;
    const z = document.getElementById('z');
    if (z) z.disabled = true;
    document.getElementById('calculateButton').querySelector('button').disabled = true;
}

// Hilfsfunktion zum Entsperren der Eingabefelder
function enableInputs() {
    document.getElementById('bitLength').disabled = false;
    document.getElementById('dimension').disabled = false;
    document.getElementById('layout').disabled = false;
    document.getElementById('x').disabled = false;
    document.getElementById('y').disabled = false;
    const z = document.getElementById('z');
    if (z) z.disabled = false;
    document.getElementById('calculateButton').querySelector('button').disabled = false;
}

function interleaveBits(coords, bitLength) {
    let mortonCode = BigInt(0);
    const maxBits = parseInt(bitLength / coords.length); // maximale anzahl bits pro koordinate 
    const totalBits = maxBits * coords.length; // Gesamtanzahl der Bits für das Padding

    // Ziel-Container im Interface für die Anzeige der Schritte
    const resultContainer = document.getElementById("result1");
    resultContainer.innerHTML = ''; // Vorherigen Inhalt löschen

    // Hilfsfunktion zum Formatieren der Binärwerte mit führenden Nullen
    
    function formatBinary(value) {
        return value.toString(2).padStart(Number(totalBits), '0');
    }

    function colorizeBits(binaryStr) {
        let coloredStr = '';
        const length = binaryStr.length;
    
        // Schleife von rechts nach links durch die Bits
        for (let k = length - 1; k >= 0; k--) {
            const colorClass = (length - 1 - k) % coords.length === 0 ? 'color-x' :
                               (length - 1 - k) % coords.length === 1 ? 'color-y' : 'color-z';
    
            // Das Bit wird der gefärbten Zeichenkette am Anfang hinzugefügt
            coloredStr = `<span class="${colorClass}">${binaryStr[k]}</span>` + coloredStr;
        }
        
        return coloredStr;
    } 

    // Hilfsfunktion zum Formatieren und Einfärben der Bits
function formatAndColorizeBits(value, colorClass) {
    return formatBinary(value)
        .split('')
        .map(bit => bit === '1' 
            ? `<span class="${colorClass}">1</span>` 
            : `<span style="color: black;">0</span>`)
        .join('');
}

// Iteration über die Bits und Koordinaten
for (let i = 0; i < maxBits; ++i) {
    for (let j = 0; j < coords.length; ++j) {
        const currentBit = (BigInt(coords[j]) & (BigInt(1) << BigInt(i)));
        const shiftedBit = currentBit << BigInt(i * (coords.length - 1) + j);
        
        // Aktualisieren von Morton-Code
        mortonCode |= shiftedBit;

        // Wählen der entsprechenden Farbe basierend auf j-Wert
        const colorClass = j === 0 ? 'color-x' : j === 1 ? 'color-y' : 'color-z';

        // Formatierte Ausgabe des currentBit und shiftedBit mit farbigen 1 und schwarzen 0
        const formattedCurrentBit = formatAndColorizeBits(currentBit, colorClass);
        const formattedShiftedBit = formatAndColorizeBits(shiftedBit, colorClass);

        // Schritt-Container erstellen und farbkodierte Bits anzeigen
        const stepDiv = document.createElement("div");
        stepDiv.classList.add("step-bit");

        stepDiv.innerHTML = `
            <p><strong>Bit position ${i}, coordinate ${['x', 'y', 'z'][j]}:</strong></p>
            <p>Current Bit: <span>${formattedCurrentBit}</span></p>
            <p>Shifted Bit: <span>${formattedShiftedBit}</span></p>
            <p>Morton Code: <span>${colorizeBits(formatBinary(mortonCode))}</span></p>
        `;

        // Schritt in den Ergebniscontainer einfügen
        resultContainer.appendChild(stepDiv);
    }
}


    // Finale Ausgabe des Morton-Codes
    const finalResult = document.createElement("div");
    finalResult.innerHTML = `<p><strong>Final Morton Code:</strong> ${colorizeBits(formatBinary(mortonCode))} (decimal: ${mortonCode.toString()})</p>`;
    resultContainer.appendChild(finalResult);

    return mortonCode;
}


// Interleave mit Magic Bits

// Masken für die verschiedenen Dimensionen
const magicBitsMasks = {
    2: [0xffffffffn, 0x0000ffff0000ffffn, 0x00ff00ff00ff00ffn, 0x0f0f0f0f0f0f0f0fn, 0x3333333333333333n, 0x5555555555555555n],
    3: [0x1fffffn, 0x1f00000000ffffn, 0x1f0000ff0000ffn, 0x100f00f00f00f00fn, 0x10c30c30c30c30c3n, 0x1249249249249249n]
};

// Generalized splitBy function for 2D and 3D
function splitByBits(a, dimension) {
    const steps = [];
    let x = BigInt(a) & magicBitsMasks[dimension][0];
    steps.push(x.toString(2).padStart(dimension === 2 ? 32 : 64, '0')); // 32 Bits für 2D, 64 Bits für 3D

    for (let i = 1; i < magicBitsMasks[dimension].length; i++) {
        const shiftAmount = BigInt(dimension === 2 ? 32 / Math.pow(2, i) : 64 / Math.pow(2, i));
        x = (x | (x << shiftAmount)) & magicBitsMasks[dimension][i];
        steps.push(x.toString(2).padStart(dimension === 2 ? 32 : 64, '0'));
    }

    return { result: x, steps };
}

// Generalized Morton encoding function for both 2D and 3D
function mortonEncodeMagicBits(coords) {
    const dimension = coords.length; // 2 for 2D, 3 for 3D
    const bitSplits = coords.map(coord => splitByBits(coord, dimension));
    const result = bitSplits.reduce((acc, { result }, index) => acc | (result << BigInt(index)), 0n);
    return { mortonCode: result, steps: bitSplits };
}

// Function to display the steps
function displayMortonEncoding(coords) {
    const { mortonCode, steps } = mortonEncodeMagicBits(coords);

    const dimension = coords.length;
    const binaryCoordinates = coords.map((coord, index) => `
        <div class="binary">${['x', 'y', 'z'][index]} = ${coord} = ${coord.toString(2).padStart(16, '0')}</div>
    `).join('');

    const bitSteps = steps.map((stepInfo, index) => `
        <h3>Bits for ${['x', 'y', 'z'][index]}:</h3>
        ${stepInfo.steps.map((step, i) => `<div class="binary">After step ${i + 1}: ${step}</div>`).join('')}
    `).join('');

    const combination = `<div class="binary">Morton Code: ${mortonCode.toString(2).padStart(dimension === 2 ? 32 : 64, '0')} (${mortonCode})</div>`;

    document.getElementById('result2').innerHTML = `<h2>Morton Code: ${mortonCode.toString(2)} (${mortonCode})</h2>`;
    document.getElementById('steps').innerHTML = `
        <h2>Calculation Steps</h2>
        ${binaryCoordinates}
        ${bitSteps}
        <h3>Combination:</h3>
        ${combination}
    `;
}


/*
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

*/

function animateInterleaveSteps(coords, bitLength, callback) {
    const stepsContainer = document.getElementById('interleaveSteps');
    stepsContainer.innerHTML = ''; // Reset container

    let mortonCode = BigInt(0);
    const maxBits = parseInt(bitLength / coords.length);
    const colors = ['color-x', 'color-y', 'color-z'];

    for (let i = 0; i < maxBits; ++i) { // i ist der aktuelle bitIndex innnerhalb jeder Koordinate 
        for (let j = 0; j < coords.length; ++j) { // j ist der Index der aktuellen Koordinate (0 für x, 1 für y, 2 für z)
            let bitValue = (BigInt(coords[j]) & (BigInt(1) << BigInt(i)));
            let shiftedValue = bitValue << BigInt(i * (coords.length - 1) + j);
            mortonCode |= shiftedValue;

            // Animation: Bit-Schritt anzeigen
            setTimeout(() => {
                const bitElement = document.createElement('span');
                bitElement.classList.add('step-bit', colors[j]);
                bitElement.textContent = ((shiftedValue > 0n) ? '1' : '0');
                stepsContainer.appendChild(bitElement);

                // Wenn die Animation am Ende ist, callback aufrufen
                if (i === maxBits - 1 && j === coords.length - 1) {
                    callback(); // Eingaben entsperren
                }

            }, 200 * (i * coords.length +j)); // Timing für schrittweise Animation (200 mal der nächste bit im Morton Code)
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
        spaceElement.innerHTML = ' <br>';
        binaryContainer.appendChild(spaceElement);
    });
}