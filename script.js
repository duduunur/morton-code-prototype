// Globale Variable für den maximalen Koordinatenwert
let maxCoordinateValue = 0n;

// Funktion zur Berechnung und Anzeige des maximalen Koordinatenwerts
function displayMaxCoord() {
    const bitLength = BigInt(document.getElementById("bitLength").value);
    const dimension = BigInt(document.getElementById("dimension").value);
    const maxCoord = document.getElementById("maxCoord");

    // Berechnung des maximalen Koordinatenwerts
    maxCoordinateValue = (1n << (bitLength / dimension)) - 1n; //1n << x verschiebt die Zahl 1 um x Bit nach links, was äquivalent zu 2^x ist 

    // Anzeige des maximalen Werts
    maxCoord.innerText = `Maximum Coordinate Value: ${maxCoordinateValue.toString()}`;

    // Fehlernachricht ausblenden
    document.getElementById("coordError").style.display = "none";
}

// Funktion zur Überprüfung, ob die Benutzereingaben die maximalen Werte überschreiten
function checkCoordinateLimits() {
    const x = BigInt(document.getElementById("x").value || 0);
    const y = BigInt(document.getElementById("y").value || 0);
    const zInput = document.getElementById("z"); // z-Eingabe optional
    const coordError = document.getElementById("coordError");

    // Prüfen, ob z vorhanden und ausgefüllt ist
    const z = zInput && zInput.value ? BigInt(zInput.value) : null;

    // Prüfen, ob die Koordinaten den Maximalwert überschreiten
    if (x > maxCoordinateValue || y > maxCoordinateValue || (z !== null && z > maxCoordinateValue)) {
        coordError.style.display = "block";
        coordError.innerText = `Coordinate exceeds the maximum allowed value!`;
        return false; // Falls die Koordinaten zu groß sind
    }

    // Fehlernachricht ausblenden, falls die Eingaben korrekt sind
    coordError.style.display = "none";
    return true; // Falls die Koordinaten innerhalb des zulässigen Bereichs liegen
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

// ---------------------------------------- Calculate Morton Code --------------------------------------------------------------

function calculateMortonCode() {
    document.getElementById("result1").innerHTML = '';
    document.getElementById("steps").innerHTML = '';


     // Überprüfe die Koordinaten vor der Berechnung
    if (checkCoordinateLimits() == false) {
        console.log("no calculation");
        return;
    }

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
        mortonCode2 = displayMagicBits(coords)
    } else {
         // interleave for-loop
        mortonCode1 = interleaveBits([x, y], bitLength);

         // interleave Magic Bits 
        mortonCode2 = displayMagicBits([x, y])
    }
}

// ---------------------------------------------- Interleave mit For-Schleife ----------------------------------------------------------


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


// ---------------------------------------------- Interleave mit Magic Bits ----------------------------------------------------------

// 3D Split-Funktion mit Berechnungsschritten
function splitBy3(a) {
    const steps = [];
    let x = BigInt(a) & 0x1fffffn; // Nur die ersten 21 Bits verwenden
    steps.push(x.toString(2).padStart(64, '0'));

    x = (x | (x << 32n)) & 0x1f00000000ffffn;
    steps.push(x.toString(2).padStart(64, '0'));

    x = (x | (x << 16n)) & 0x1f0000ff0000ffn;
    steps.push(x.toString(2).padStart(64, '0'));

    x = (x | (x << 8n)) & 0x100f00f00f00f00fn;
    steps.push(x.toString(2).padStart(64, '0'));

    x = (x | (x << 4n)) & 0x10c30c30c30c30c3n;
    steps.push(x.toString(2).padStart(64, '0'));

    x = (x | (x << 2n)) & 0x1249249249249249n;
    steps.push(x.toString(2).padStart(64, '0'));

    return { result: x, steps };
}

// Morton-Encoding für 3D mit Magic Bits und Schrittausgabe
function mortonEncodeMagicBits3D(x,y,z) {
    const xSplit = splitBy3(x);
    const ySplit = splitBy3(y);
    const zSplit = splitBy3(z);

    // Kombinieren der Ergebnisse für x, y und z (mit entsprechenden Verschiebungen)
    const result = xSplit.result | (ySplit.result << 1n) | (zSplit.result << 2n);

    return { mortonCode: result, steps: [xSplit, ySplit, zSplit] };
}

// 2D Split-Funktion mit Berechnungsschritten
function splitBy2(a) {
    const steps = [];
    let x = BigInt(a) & 0xffffffffn; // Nur die ersten 32 Bits verwenden
    steps.push(x.toString(2).padStart(64, '0'));

    x = (x | (x << 16n)) & 0x0000ffff0000ffffn;
    steps.push(x.toString(2).padStart(64, '0'));

    x = (x | (x << 8n)) & 0x00ff00ff00ff00ffn;
    steps.push(x.toString(2).padStart(64, '0'));

    x = (x | (x << 4n)) & 0x0f0f0f0f0f0f0f0fn;
    steps.push(x.toString(2).padStart(64, '0'));

    x = (x | (x << 2n)) & 0x3333333333333333n;
    steps.push(x.toString(2).padStart(64, '0'));

    x = (x | (x << 1n)) & 0x5555555555555555n;
    steps.push(x.toString(2).padStart(64, '0'));

    return { result: x, steps };
}

// Morton-Encoding für 2D mit Magic Bits und Schrittausgabe
function mortonEncodeMagicBits2D(x, y) {
    const xSplit = splitBy2(x);
    const ySplit = splitBy2(y);
    const result = xSplit.result | (ySplit.result << 1n);

    return { mortonCode: result, steps: [xSplit, ySplit] };
}

// Anzeige der Schritte für Morton-Encoding (2D oder 3D)
function displayMagicBits(coords) {
    const bitLength = document.getElementById("bitLength").value;
    const dimension = coords.length;
    const maxBits = parseInt(bitLength / dimension);

    // Morton-Encoding entsprechend Dimension (2D oder 3D)
    const { mortonCode, steps } = dimension === 2
        ? mortonEncodeMagicBits2D(coords[0], coords[1])
        : mortonEncodeMagicBits3D(coords[0], coords[1], coords[2]);

    // Formatierung der Koordinaten
    const binaryCoordinates = coords.map((coord, index) => {
        const colorClass = index === 0 ? 'color-x' : index === 1 ? 'color-y' : 'color-z';
        const binaryString = coord.toString(2).padStart(maxBits, '0')
            .split('')
            .map(bit => `<span class="${colorClass}">${bit}</span>`)
            .join('');
        return `<div class="binary">${['x', 'y', 'z'][index]} = ${binaryString}</div>`;
    }).join('');

    // Schritte formatieren und farbig kodieren
    const bitSteps = steps.map((stepInfo, index) => {
        const colorClass = index === 0 ? 'color-x' : index === 1 ? 'color-y' : 'color-z';
        return `
            <h4>Bits for ${['x', 'y', 'z'][index]}:</h4>
            ${stepInfo.steps.map((step, i) => {
                const coloredStep = step
                    .split('')
                    .map(bit => `<span class="${colorClass}">${bit}</span>`)
                    .join('');
                return `<div class="binary">After step ${i + 1}: ${coloredStep}</div>`;
            }).join('')}
        `;
    }).join('');

    // Kombination (Morton-Code)
    const combination = `
    <div class="binary">Morton Code: ${
        mortonCode.toString(2)
            .padStart(maxBits * dimension, '0')
            .split('')
            .map((bit, index, arr) => {
                const reversedIndex = arr.length - 1 - index;
                const colorClass = reversedIndex % dimension === 0 ? 'color-x' :
                                   reversedIndex % dimension === 1 ? 'color-y' : 'color-z';
                return `<span class="${colorClass}">${bit}</span>`;
            })
            .join('')
    } (${mortonCode})</div>
    `;

    document.getElementById('steps').innerHTML = `
        ${binaryCoordinates}
        ${bitSteps}
        <h4>Combination:</h4>
        ${combination}
    `;
}
