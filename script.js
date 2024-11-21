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
    checkCoordinateLimits();
}

// Funktion zur Überprüfung, ob die Benutzereingaben die maximalen Werte überschreiten
function checkCoordinateLimits() {
    const xInput = document.getElementById("x");
    const yInput = document.getElementById("y");
    const zInput = document.getElementById("z"); // z-Eingabe optional
    const coordError = document.getElementById("coordError");

    const x = BigInt(xInput.value || 0);
    const y = BigInt(yInput.value || 0);
    const z = zInput && zInput.value ? BigInt(zInput.value) : null;

    let hasError = false; // Flag, ob ein Fehler aufgetreten ist

    // Überprüfe jede Koordinate und passe den Stil entsprechend an
    if (x > maxCoordinateValue) {
        xInput.style.border = "1px solid red";
        hasError = true;
    } else {
        xInput.style.border = ""; // Entferne den roten Rahmen
    }

    if (y > maxCoordinateValue) {
        yInput.style.border = "1px solid red";
        hasError = true;
    } else {
        yInput.style.border = ""; // Entferne den roten Rahmen
    }

    if (zInput && z !== null) {
        if (z > maxCoordinateValue) {
            zInput.style.border = "1px solid red";
            hasError = true;
        } else {
            zInput.style.border = ""; // Entferne den roten Rahmen
        }
    }

    // Wenn ein Fehler aufgetreten ist, zeige die Fehlermeldung
    if (hasError) {
        coordError.style.display = "block";
        coordError.innerText = `Coordinate exceeds the maximum allowed value!`;
        return false; // Fehlerhafte Eingabe
    }

    // Fehlernachricht ausblenden und Rahmen zurücksetzen
    coordError.style.display = "none";
    return true; // Eingaben sind gültig
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


// -------------------------------------------------- Calculate Morton Code --------------------------------------------------------------

function calculateMortonCode() {
    document.getElementById("resultForLoop").innerHTML = '';
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


    if (dimension === "3") {
        const coords = layout === "xyz" ? [x, y, z] : [z, y, x];
        // interleave for-loop
        interleaveForLoop(coords, bitLength);

        // interleave Magic Bits 
        displayMagicBits(coords, bitLength)
    } else {
        // interleave for-loop
        interleaveForLoop([x, y], bitLength);

        // interleave Magic Bits 
        displayMagicBits([x, y], bitLength)
    }
}

// ---------------------------------------------- Interleave mit For-Schleife ----------------------------------------------------------


function interleaveForLoop(coords, bitLength) {
    let mortonCode = BigInt(0);
    const bitsPerCoord = parseInt(bitLength / coords.length); // Anzahl der Bits pro Koordinate 
    const bitsMortonCode = bitsPerCoord * coords.length; // Bitlänge Morton Code  

    // Ziel-Container im Interface für die Anzeige der Schritte
    const resultContainer = document.getElementById("resultForLoop");
    resultContainer.innerHTML = ''; // Vorherigen Inhalt löschen

    // format input coordinates
    const binaryCoordinates = coords.map((coord, index) => {
        const colorClass = index === 0 ? 'color-x' : index === 1 ? 'color-y' : 'color-z'; // colors
        const binaryString = coord.toString(2).padStart(bitsPerCoord, '0') // binary and padding
            .split('')
            .map(bit => `<span class="${colorClass}">${bit}</span>`) // colorize
            .join('');
        return `<div class="binary">${['x', 'y', 'z'][index]} = ${binaryString} (decimal: ${coord})</div>`; // display
    }).join('');

    // display input coordinates
    const coordinates = document.createElement("div");
    coordinates.innerHTML = `${binaryCoordinates}`;
    resultContainer.appendChild(coordinates);

    // Morton Code mit Nullen Füllen 
    function formatBinary(value) {
        return value.toString(2).padStart(Number(bitsMortonCode), '0');
    }

    // Morton Code färben
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

    // Current Bit und shifted bit formatieren
    function formatAndColorizeBits(value, colorClass) {
        return formatBinary(value)
            .split('')
            .map(bit => bit === '1'
                ? `<span class="${colorClass}">1</span>`
                : `<span style="color: black;">0</span>`)
            .join('');
    }


    // Iteration über die Bits und Koordinaten
    for (let i = 0; i < bitsPerCoord; ++i) {
        for (let j = 0; j < coords.length; ++j) {
            const currentBit = (BigInt(coords[j]) & (BigInt(1) << BigInt(i)));
            const shiftedBit = currentBit << BigInt(i * (coords.length - 1) + j);

            // Aktualisieren von Morton-Code
            mortonCode |= shiftedBit;

            // Wählen der entsprechenden Farbe basierend auf j-Wert
            const colorClass = j === 0 ? 'color-x' : j === 1 ? 'color-y' : 'color-z';

            // Formatierte Ausgabe des aktuellen Bits und des verschobenen Bits
            const formattedCurrentBit = formatAndColorizeBits(
                currentBit, colorClass
            );
            const formattedShiftedBit = formatAndColorizeBits(
                shiftedBit, colorClass
            );

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
function splitBy3(a, bitLength) {
    const steps = [];
    let x = BigInt(a);

    if (bitLength === 64) {

        x = (x | (x << 32n)) & 0x1f00000000ffffn;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 16n)) & 0x1f0000ff0000ffn;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 8n)) & 0x100f00f00f00f00fn;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 4n)) & 0x10c30c30c30c30c3n;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 2n)) & 0x1249249249249249n;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        return { result: x, steps };

    } else if (bitLength === 32) {

        x = (x | (x << 16n)) & 0x30000ffn;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 8n)) & 0x0300f00fn;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 4n)) & 0x30c30c3n;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 2n)) & 0x9249249n;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        return { result: x, steps };

    } else if (bitLength === 16) {

        x = (x | (x << 8n)) & 0x0300F00Fn;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 4n)) & 0x030C30C3n;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 2n)) & 0x09249249n;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        return { result: x, steps };

    } else {
        console.log("Bitlänge ungültig");
        return { result: 0, steps };
    }
}

// Morton-Encoding für 3D mit Magic Bits und Schrittausgabe
function mortonEncodeMagicBits3D(x, y, z, bitLength) {
    const xSplit = splitBy3(x, bitLength);
    const ySplit = splitBy3(y, bitLength);
    const zSplit = splitBy3(z, bitLength);

    // Kombinieren der Ergebnisse für x, y und z (mit entsprechenden Verschiebungen)
    const result = xSplit.result | (ySplit.result << 1n) | (zSplit.result << 2n);

    return { mortonCode: result, steps: [xSplit, ySplit, zSplit] };
}

// 2D Split-Funktion mit Berechnungsschritten
function splitBy2(a, bitLength) {
    const steps = [];
    let x = BigInt(a);

    if (bitLength === 64) {

        x = (x | (x << 32n)) & 0x00000000FFFFFFFFn;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 16n)) & 0x0000FFFF0000FFFFn;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 8n)) & 0x00FF00FF00FF00FFn;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 4n)) & 0x0F0F0F0F0F0F0F0Fn;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 2n)) & 0x3333333333333333n;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 1n)) & 0x5555555555555555n;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        return { result: x, steps };

    } else if (bitLength === 32) {

        x = (x | (x << 16n)) & 0x0000ffffn;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 8n)) & 0x00ff00ffn;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 4n)) & 0x0f0f0f0fn;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 2n)) & 0x33333333n;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 1n)) & 0x55555555n;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        return { result: x, steps };

    } else if (bitLength === 16) {

        x = (x | (x << 4n)) & 0x0F0Fn;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 2n)) & 0x3333n;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        x = (x | (x << 1n)) & 0x5555n;
        steps.push(x.toString(2).padStart(bitLength, '0'));

        return { result: x, steps };

    } else {
        console.log("Bitlänge ungültig");
        return { result: 0, steps };
    }
}

// Morton-Encoding für 2D mit Magic Bits und Schrittausgabe
function mortonEncodeMagicBits2D(x, y, bitLength) {
    const xSplit = splitBy2(x, bitLength);
    const ySplit = splitBy2(y, bitLength);
    const result = xSplit.result | (ySplit.result << 1n);

    return { mortonCode: result, steps: [xSplit, ySplit] };
}

// Anzeige der Schritte für Morton-Encoding (2D oder 3D)
function displayMagicBits(coords, bitLength) {
    const dimension = coords.length;
    const maxBits = parseInt(bitLength / dimension);

    // Morton-Encoding entsprechend Dimension (2D oder 3D)
    const { mortonCode, steps } = dimension === 2
        ? mortonEncodeMagicBits2D(coords[0], coords[1], bitLength)
        : mortonEncodeMagicBits3D(coords[0], coords[1], coords[2], bitLength);

    // display coordinates in binary and colorized
    const binaryCoordinates = coords.map((coord, index) => {
        const colorClass = index === 0 ? 'color-x' : index === 1 ? 'color-y' : 'color-z';
        const binaryString = coord.toString(2).padStart(maxBits, '0')
            .split('')
            .map(bit => `<span class="${colorClass}">${bit}</span>`)
            .join('');
        return `<div class="binary">${['x', 'y', 'z'][index]} = ${binaryString} (decimal: ${coord})</div>`;
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
    <div class="binary">Morton Code: ${mortonCode.toString(2)
            .padStart(maxBits * dimension, '0')
            .split('')
            .map((bit, index, arr) => {
                const reversedIndex = arr.length - 1 - index;
                const colorClass = reversedIndex % dimension === 0 ? 'color-x' :
                    reversedIndex % dimension === 1 ? 'color-y' : 'color-z';
                return `<span class="${colorClass}">${bit}</span>`;
            })
            .join('')
        } (decimal: ${mortonCode})</div>
    `;


    //AUSGABE
    document.getElementById('steps').innerHTML = `
        ${binaryCoordinates}
        ${bitSteps}
        <h4>Combination:</h4>
        ${combination}
    `;
}

// ----------------------------------------------- Quellcode anzeigen -------------------------------------------------------

const forLoopCode = `<h3>For Loop Algorithm</h3>

function interleave(coords, bitLength) {
    const bitsPerCoord = bitLength / coords.length; 

    for (let i = 0; i < bitsPerCoord; ++i) {
        for (let j = 0; j < coords.length; ++j) {
            const currentBit = (coords[j] & (1 << i));
            const shiftedBit = currentBit << (i * (coords.length - 1) + j);
        
            mortonCode |= shiftedBit;
        }
    } 
}

`;

const magicBitsCode = `<h3>Magic Bits Algorithm (3D)</h3>

function splitBy3(x, bitLength) {

    if (bitLength === 64) {

        x = (x | (x << 32n)) & 0x1f00000000ffff;
        x = (x | (x << 16n)) & 0x1f0000ff0000ff;
        x = (x | (x << 8n)) & 0x100f00f00f00f00f;
        x = (x | (x << 4n)) & 0x10c30c30c30c30c3;
        x = (x | (x << 2n)) & 0x1249249249249249;

        return x;

    } else if (bitLength === 32) {    

        x = (x | (x << 16n)) & 0x30000ff;
        x = (x | (x << 8n)) & 0x0300f00f;
        x = (x | (x << 4n)) & 0x30c30c3;
        x = (x | (x << 2n)) & 0x9249249;

        return x;

    } else if (bitLength === 16) {

        x = (x | (x << 8n)) & 0x0300F00F;
        x = (x | (x << 4n)) & 0x030C30C3;
        x = (x | (x << 2n)) & 0x09249249;
    
        return x;
    }
}

function encodeMagicBits3D(x,y,z, bitLength) {
    const xSplit = splitBy3(x, bitLength);
    const ySplit = splitBy3(y, bitLength);
    const zSplit = splitBy3(z, bitLength);

    const result = xSplit.result 
                | (ySplit.result << 1n) 
                | (zSplit.result << 2n);


    return result;
}
`;

const magicBitsCode2D = `<h3>Magic Bits Algorithm (2D)</h3>

function splitBy2(x, bitLength) {

    if (bitLength === 64) {

        x = (x | (x << 32n)) & 0x00000000FFFFFFFF;
        x = (x | (x << 16n)) & 0x0000FFFF0000FFFF;
        x = (x | (x << 8n)) & 0x00FF00FF00FF00FF;
        x = (x | (x << 4n)) & 0x0F0F0F0F0F0F0F0F;
        x = (x | (x << 2n)) & 0x3333333333333333;
        x = (x | (x << 1n)) & 0x5555555555555555;

        return result;

    } else if (bitLength === 32) {    

        x = (x | (x << 16n)) & 0x0000ffff;
        x = (x | (x << 8n)) & 0x00ff00ff;
        x = (x | (x << 4n)) & 0x0f0f0f0f;
        x = (x | (x << 2n)) & 0x33333333;
        x = (x | (x << 1n)) & 0x55555555;
    
        return result;

    } else if (bitLength === 16) {

        x = (x | (x << 4n)) & 0x0F0F;
        x = (x | (x << 2n)) & 0x3333;
        x = (x | (x << 1n)) & 0x5555;

        return result;
    }
}

function encodeMagicBits2D(x, y, bitLength) {
    const xSplit = splitBy2(x, bitLength);
    const ySplit = splitBy2(y, bitLength);
    const result = xSplit.result | (ySplit.result << 1n);

    return result;
}
`;


function toggleCode(codeContainerId, HeaderId, buttonId, resultContainerId, code) {
    const codeContainer = document.getElementById(codeContainerId);
    const resultContainer = document.getElementById(resultContainerId);
    const headerContainer = document.getElementById(HeaderId);
    const button = document.getElementById(buttonId);
    const dimension = document.getElementById("dimension").value;

    if (dimension === "2" && code === magicBitsCode) {
        code = magicBitsCode2D;
    }

    codeContainer.classList.remove("hidden");
    headerContainer.classList.add("hidden");
    resultContainer.classList.add("hidden");
    codeContainer.innerHTML = `
        <button class="close-btn" onclick="closeCode('${codeContainerId}', '${HeaderId}', '${resultContainerId}', '${buttonId}')">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        </button>
        <pre class="code">${code}</pre>
        `;
    button.classList.add("hidden");
}

function closeCode(codeContainerId, HeaderId, resultContainerId, buttonId) {
    const codeContainer = document.getElementById(codeContainerId);
    const resultContainer = document.getElementById(resultContainerId);
    const headerContainer = document.getElementById(HeaderId);
    const button = document.getElementById(buttonId);

    codeContainer.classList.add("hidden");
    headerContainer.classList.remove("hidden");
    resultContainer.classList.remove("hidden");
    button.classList.remove("hidden");
    codeContainer.innerHTML = ''; // Code entfernen
}
