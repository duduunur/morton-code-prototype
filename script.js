// Globale Variablen
let maxCoordinateValue = 0n;

const pointA = {
    id: 'a',
    x: null,
    y: null,
    z: null, // Optional für 3D
    mortonCode: null
};

const pointB = {
    id: 'b',
    x: null,
    y: null,
    z: null, // Optional für 3D
    mortonCode: null
};

// --------------------------------------------------- handle settings and update page ---------------------------------------------------

function displayMaxCoord() {
    const bitLength = BigInt(document.getElementById("bitLength").value);
    const dimension = BigInt(document.getElementById("dimension").value);
    const maxCoord = document.getElementById("maxCoord");

    maxCoordinateValue = (1n << (bitLength / dimension)) - 1n; //1n << x verschiebt die Zahl 1 um x Bit nach links, was äquivalent zu 2^x ist 

    maxCoord.innerText = `Maximum Coordinate Value: ${maxCoordinateValue.toString()}`;

    clearContainers();
    checkCoordinateLimits('a');
    checkCoordinateLimits('b');
}

function clearContainers() {
    // Ergebnis Container leeren
    document.getElementById(`a-resultForLoop`).innerHTML = '';
    document.getElementById(`a-resultMagicBits`).innerHTML = '';
    document.getElementById(`b-resultForLoop`).innerHTML = '';
    document.getElementById(`b-resultMagicBits`).innerHTML = '';
    document.getElementById(`resultAddition`).innerHTML = '';
    document.getElementById(`resultSubtraction`).innerHTML = '';
    document.getElementById(`additionError`).innerHTML = '';
    document.getElementById(`subtractionError`).innerHTML = '';

    // Point Container höhe "zurücksetzen"
    document.getElementById(`point-a`).style.height = '250px';
    document.getElementById(`point-b`).style.height = '250px';
    document.getElementById(`point-a`).style.resize = 'none';
    document.getElementById(`point-b`).style.resize = 'none';
}

function checkCoordinateLimits(pointId) {
    const xInput = document.getElementById(`${pointId}-x`);
    const yInput = document.getElementById(`${pointId}-y`);
    const zInput = document.getElementById(`${pointId}-z`);

    const xError = document.getElementById(`${pointId}-xError`);
    const yError = document.getElementById(`${pointId}-yError`);
    const zError = document.getElementById(`${pointId}-zError`);

    const x = xInput && xInput.value ? xInput.value : null;
    const y = yInput && yInput.value ? yInput.value : null;
    const z = zInput && zInput.value ? zInput.value : null;

    console.log("x:" + x);
    console.log("y:" + y);
    console.log("z:" + z);

    let hasError = false;

    // Helper function for invalid input
    function isInvalidCoordinate(value) {
        return isNaN(value) || value.includes(".") || value < 0;
    }

    // Validate X
    if (isInvalidCoordinate(x) || BigInt(x) > maxCoordinateValue) {
        xInput.style.border = "1px solid red";
        xError.textContent = "Enter an integer between 0 and "+ maxCoordinateValue;
        xError.style.display = "block";
        hasError = true;
    } else {
        xInput.style.border = "";
        xError.textContent = "";
        xError.style.display = "none";
    }

    // Validate Y
    if (isInvalidCoordinate(y) || BigInt(y) > maxCoordinateValue) {
        yInput.style.border = "1px solid red";
        yError.textContent = "Enter an integer between 0 and "+ maxCoordinateValue;
        yError.style.display = "block";
        hasError = true;
    } else {
        yInput.style.border = "";
        yError.textContent = "";
        yError.style.display = "none";
    }

    // Validate Z (if present)
    if (zInput && z !== null) {
        if (isInvalidCoordinate(z) || BigInt(z) > maxCoordinateValue) {
            zInput.style.border = "1px solid red";
            zError.textContent = "Enter an integer between 0 and "+ maxCoordinateValue;
            zError.style.display = "block";
            hasError = true;
        } else {
            zInput.style.border = "";
            zError.textContent = "";
            zError.style.display = "none";
        }
    }

    return !hasError;
}

function toggleCoordinateFields(pointId) {
    console.log("toggle aufgerufen")
    const dimension = document.getElementById("dimension").value;
    const layout = document.getElementById("layout");
    const layoutContainer = document.getElementById("layoutContainer");
    const zInput = document.getElementById(`${pointId}-zInput`);
    const zLabel = document.getElementById(`${pointId}-zLabel`);
    const zError = document.getElementById(`${pointId}-zError`);

    clearCoordinateInputs(pointId);

    if (dimension === '3') {
        zLabel.classList.remove('hidden');
        zInput.classList.remove('hidden');
        zError.classList.remove('hidden');
        layoutContainer.classList.remove("hidden");
    } else {
        zLabel.classList.add('hidden');
        zInput.classList.add('hidden');
        zError.classList.add('hidden');
        layoutContainer.classList.add("hidden"); 
        layout.value = 'xyz';
    }

    // Reihenfolge der Eingabefelder (in Abhängigkeit vom Layout) aktualisieren 
    updateCoordinateInputOrder(layout.value, pointId);
}


function clearCoordinateInputs(pointId) {
    document.getElementById(`${pointId}-x`).value = "";
    document.getElementById(`${pointId}-y`).value = "";
    const zInput = document.getElementById(`${pointId}-z`);
    if (zInput) {
        zInput.value = "";
    }
}


function updateCoordinateInputOrder(layout, pointId) {
    const xLabel = document.querySelector(`label[for="${pointId}-x"]`);
    const yLabel = document.querySelector(`label[for="${pointId}-y"]`);
    const zLabel = document.querySelector(`label[for="${pointId}-z"]`);

    const xGroup = document.querySelector(`#${pointId}-x`).closest('.input-group');
    const yGroup = document.querySelector(`#${pointId}-y`).closest('.input-group');
    const zGroup = document.querySelector(`#${pointId}-zInput`);

    const calculateButton = document.getElementById(`${pointId}-calculateButton`);
    const coordinateInputs = document.getElementById(`${pointId}-coordinateInputs`);

    // Container leeren
    coordinateInputs.innerHTML = '';

    // Layout anpassen
    if (layout === 'xyz') {
        coordinateInputs.appendChild(xLabel);
        coordinateInputs.appendChild(xGroup);
        coordinateInputs.appendChild(yLabel);
        coordinateInputs.appendChild(yGroup);
        if (zLabel) coordinateInputs.appendChild(zLabel);
        if (zGroup) coordinateInputs.appendChild(zGroup);
        if (calculateButton) coordinateInputs.appendChild(calculateButton);
    } else if (layout === 'zyx') {
        if (zLabel) coordinateInputs.appendChild(zLabel);
        if (zGroup) coordinateInputs.appendChild(zGroup);
        coordinateInputs.appendChild(yLabel);
        coordinateInputs.appendChild(yGroup);
        coordinateInputs.appendChild(xLabel);
        coordinateInputs.appendChild(xGroup);
        if (calculateButton) coordinateInputs.appendChild(calculateButton);
    }
}

function handleSettingsChange() {
    toggleCoordinateFields('a');
    toggleCoordinateFields('b');
    displayMaxCoord();
    handleDimensionOrBitLengthChange();
}

// -------------------------------------------------- Calculate Morton Code --------------------------------------------------------------

function calculateMortonCode(pointId) {
    // Ergebnisse zurücksetzen
    document.getElementById(`${pointId}-resultForLoop`).innerHTML = '';
    document.getElementById(`${pointId}-resultMagicBits`).innerHTML = '';
    document.getElementById(`resultAddition`).innerHTML = '';
    document.getElementById(`resultSubtraction`).innerHTML = '';
    document.getElementById(`additionError`).innerHTML = '';
    document.getElementById(`subtractionError`).innerHTML = '';

    // Koordinaten überprüfen
    if (checkCoordinateLimits(pointId) == false) {
        console.log("No calculation for point", pointId);
        return;
    }

    const pointContainer = document.getElementById(`point-${pointId}`);
    pointContainer.style.height = '500px';
    pointContainer.style.resize = 'vertical';

    const bitLength = parseInt(document.getElementById("bitLength").value);
    const dimension = document.getElementById("dimension").value;
    const layout = document.getElementById("layout").value;

    const x = parseInt(document.getElementById(`${pointId}-x`).value);
    const y = parseInt(document.getElementById(`${pointId}-y`).value);
    const z = dimension === "3" ? (parseInt(document.getElementById(`${pointId}-z`).value)) : 0;

    let coords = [];
    if (dimension === "3") {
        coords = layout === "xyz" ? [x, y, z] : [z, y, x];
    } else {
        coords = [x, y];
    }

    // Berechnungen durchführen
    const mortonCode = interleaveForLoop(coords, bitLength, layout, pointId);
    displayMagicBits(coords, bitLength, layout, pointId);

    // Morton-Codes und Koordinaten speichern
    const point = pointId === 'a' ? pointA : pointB;
    point.x = x;
    point.y = y;
    point.z = dimension === "3" ? z : null; // Z nur speichern, wenn Dimension 3
    point.mortonCode = mortonCode;
}

// ---------------------------------------------- Interleave mit For-Schleife ----------------------------------------------------------


function interleaveForLoop(coords, bitLength, layout, pointId) {
    let mortonCode = BigInt(0);
    console.log(coords)
    const bitsPerCoord = parseInt(bitLength / coords.length); 
    const bitsMortonCode = bitsPerCoord * coords.length;
    //console.log(layout);

    const resultContainer = document.getElementById(`${pointId}-resultForLoop`);

    // format input coordinates
    let binaryCoordinates = '';
    for (let i = 0; i < coords.length; i++) {
        const coord = coords[i];
        const colorClass = i === 0 ? 'color-x' : i === 1 ? 'color-y' : 'color-z'; // Farben basierend auf Index
        const binaryString = coord.toString(2).padStart(bitsPerCoord, '0'); // Binärformatierung mit Padding
    
        let formattedBits = '';
        for (let bitIndex = 0; bitIndex < binaryString.length; bitIndex++) {
            formattedBits += `<span class="${colorClass}">${binaryString[bitIndex]}</span>`; // Bits einfärben
        }
    
        binaryCoordinates += `<div class="binary">${layout[i]} = ${formattedBits} (decimal: ${coord})</div>`; // Eingabekoordinaten anzeigen
    }

    // display input coordinates
    const coordinates = document.createElement("div");
    coordinates.innerHTML = `${binaryCoordinates}<br>`;
    resultContainer.appendChild(coordinates);

    // Morton Code und Rechenschritte mit Nullen füllen 
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
        const binaryString = formatBinary(value);
        let formattedBits = '';
    
        for (let i = 0; i < binaryString.length; i++) {
            const bit = binaryString[i];
            if (bit === '1') {
                formattedBits += `<span class="${colorClass}">1</span>`;
            } else {
                formattedBits += `<span style="color: black;">0</span>`;
            }
        }
    
        return formattedBits;
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
            const formattedCurrentBit = formatAndColorizeBits(currentBit, colorClass);
            const formattedShiftedBit = formatAndColorizeBits(shiftedBit, colorClass);

            // Schritt-Container erstellen und farbkodierte Bits anzeigen
            const stepDiv = document.createElement("div");
            stepDiv.classList.add("step-bit");

            stepDiv.innerHTML = `
            <p><strong>Bit position ${i}, coordinate ${layout[j]}:</strong></p>
            <p>Current Bit: <span>${formattedCurrentBit}</span></p>
            <p>Shifted Bit: <span>${formattedShiftedBit}</span></p>
            <p>Morton Code: <span>${colorizeBits(formatBinary(mortonCode))}</span></p><br>
        `;
            resultContainer.appendChild(stepDiv);
        }
    }

    const finalResult = document.createElement("div");
    finalResult.innerHTML = `<p><strong>Final Morton Code:</strong> ${colorizeBits(formatBinary(mortonCode))} (decimal: ${mortonCode.toString()})</p>`;
    resultContainer.appendChild(finalResult);

    return mortonCode;
}


// ---------------------------------------------- Interleave mit Magic Bits ----------------------------------------------------------

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

function mortonEncodeMagicBits3D(x, y, z, bitLength) {
    const xSplit = splitBy3(x, bitLength);
    const ySplit = splitBy3(y, bitLength);
    const zSplit = splitBy3(z, bitLength);

    const result = xSplit.result | (ySplit.result << 1n) | (zSplit.result << 2n);

    return { mortonCode: result, steps: [xSplit, ySplit, zSplit] };
}


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
        console.log(bitLength)
        console.log("Bitlänge ungültig");
        return { result: 0, steps };
    } 
}

function mortonEncodeMagicBits2D(x, y, bitLength) {
    const xSplit = splitBy2(x, bitLength);
    const ySplit = splitBy2(y, bitLength);
    const result = xSplit.result | (ySplit.result << 1n);

    return { mortonCode: result, steps: [xSplit, ySplit] };
}

function displayMagicBits(coords, bitLength, layout, pointId) {
    const resultContainer = document.getElementById(`${pointId}-resultMagicBits`);
    const dimension = coords.length;
    const maxBits = parseInt(bitLength / dimension);

    // Berechnung entsprechend Dimension
    const { mortonCode, steps } = dimension === 2
        ? mortonEncodeMagicBits2D(coords[0], coords[1], bitLength)
        : mortonEncodeMagicBits3D(coords[0], coords[1], coords[2], bitLength);

    // display coordinates in binary and colorized
    let binaryCoordinates = '';
    for (let i = 0; i < coords.length; i++) {
        const coord = coords[i];
        const colorClass = i === 0 ? 'color-x' : i === 1 ? 'color-y' : 'color-z';
        const binaryString = `<span class="${colorClass}">${coord.toString(2).padStart(maxBits, '0')}</span>`;
        binaryCoordinates += `<div class="binary">${layout[i]} = ${binaryString} (decimal: ${coord})</div>`;
    }


    // Schritte formatieren und farbig kodieren
    let bitSteps = '';
    for (let i = 0; i < steps.length; i++) {
        const stepInfo = steps[i];
        const colorClass = i === 0 ? 'color-x' : i === 1 ? 'color-y' : 'color-z';
        bitSteps += `<h4>Bits for ${layout[i]}:</h4>`;
        for (let i = 0; i < stepInfo.steps.length; i++) {
            const step = stepInfo.steps[i];
            bitSteps += `<div class="binary">After step ${i + 1}: <span class="${colorClass}">${step}</span></div>`;
        }
    }
      

    // Kombination (Morton-Code)
    let mortonCodeBinary = mortonCode.toString(2).padStart(maxBits * dimension, '0');
    let formattedBits = '';

    for (let i = 0; i < mortonCodeBinary.length; i++) {
        const reversedIndex = mortonCodeBinary.length - 1 - i;
        const colorClass = reversedIndex % dimension === 0 ? 'color-x' :
        reversedIndex % dimension === 1 ? 'color-y' : 'color-z';
        formattedBits += `<span class="${colorClass}">${mortonCodeBinary[i]}</span>`;
    }

    const combination = `
        <div class="binary">Morton Code: ${formattedBits} (decimal: ${mortonCode})</div>
    `;

    resultContainer.innerHTML = `
        ${binaryCoordinates}
        ${bitSteps}
        <h4>Combination:</h4>
        ${combination}
    `;

    return combination;
}

// ----------------------------------------------- Quellcode anzeigen -------------------------------------------------------

const forLoopCode = `For Loop Algorithm

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


const magicBitsCode3D64 = `Magic Bits Algorithm 3D

function splitBy3(x) {
    x = (x | (x << 32)) & 0x1F00000000FFFF;
    x = (x | (x << 16)) & 0x1F0000FF0000FF;
    x = (x | (x << 8)) & 0x100F00F00F00F00F;
    x = (x | (x << 4)) & 0x10C30C30C30C30C3;
    x = (x | (x << 2)) & 0x1249249249249249;

    return x;
}

function encodeMagicBits3D(x,y,z) {
    const xSplit = splitBy3(x);
    const ySplit = splitBy3(y);
    const zSplit = splitBy3(z);

    const result = xSplit 
                | (ySplit << 1) 
                | (zSplit << 2);

    return result;
}
`;


const magicBitsCode3D32 = `Magic Bits Algorithm 3D

function splitBy3(x) {
    x = (x | (x << 16)) & 0x30000FF;
    x = (x | (x << 8)) & 0x0300F00F;
    x = (x | (x << 4)) & 0x30C30C3;
    x = (x | (x << 2)) & 0x9249249;

    return x;
}

function encodeMagicBits3D(x,y,z) {
    const xSplit = splitBy3(x);
    const ySplit = splitBy3(y);
    const zSplit = splitBy3(z);

    const result = xSplit 
                | (ySplit << 1) 
                | (zSplit << 2);

    return result;
}
`;

const magicBitsCode3D16 = `Magic Bits Algorithm 3D

function splitBy3(x) {
    x = (x | (x << 8)) & 0x0300F00F;
    x = (x | (x << 4)) & 0x030C30C3;
    x = (x | (x << 2)) & 0x09249249;

    return x;   
}

function encodeMagicBits3D(x,y,z) {
    const xSplit = splitBy3(x);
    const ySplit = splitBy3(y);
    const zSplit = splitBy3(z);

    const result = xSplit 
                | (ySplit << 1) 
                | (zSplit << 2);

    return result;
}
`;

const magicBitsCode2D64 = `Magic Bits Algorithm 2D

function splitBy2(x) {
    x = (x | (x << 32)) & 0x00000000FFFFFFFF;
    x = (x | (x << 16)) & 0x0000FFFF0000FFFF;
    x = (x | (x << 8)) & 0x00FF00FF00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F0F0F0F0F;
    x = (x | (x << 2)) & 0x3333333333333333;
    x = (x | (x << 1)) & 0x5555555555555555;

    return x;
}

function encodeMagicBits2D(x, y) {
    const xSplit = splitBy2(x);
    const ySplit = splitBy2(y);
    const result = xSplit | (ySplit << 1);

    return result;
}
`;

const magicBitsCode2D32 = `Magic Bits Algorithm 2D

function splitBy2(x) {
    x = (x | (x << 16)) & 0x0000FFFF;
    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;
    
    return x;
}

function encodeMagicBits2D(x, y) {
    const xSplit = splitBy2(x);
    const ySplit = splitBy2(y);
    const result = xSplit | (ySplit << 1);

    return result;
}
`;

const magicBitsCode2D16 = `Magic Bits Algorithm 2D

function splitBy2(x) {
    x = (x | (x << 4)) & 0x0F0F;
    x = (x | (x << 2)) & 0x3333;
    x = (x | (x << 1)) & 0x5555;

    return x;
}

function encodeMagicBits(x, y) {
    const xSplit = splitBy2(x);
    const ySplit = splitBy2(y);
    const result = xSplit | (ySplit << 1);

    return result;
}
`;


function toggleCode(codeContainerId, HeaderId, buttonId, resultContainerId, code) {
    const codeContainer = document.getElementById(codeContainerId);
    const resultContainer = document.getElementById(resultContainerId);
    const headerContainer = document.getElementById(HeaderId);
    const button = document.getElementById(buttonId);
    const dimension = document.getElementById("dimension").value;
    const bitLength = document.getElementById("bitLength").value;

    if (code === "magicBitsCode") {
        if (dimension === "2") {
            code = bitLength === "64" ? magicBitsCode2D64 :
                   bitLength === "32" ? magicBitsCode2D32 : magicBitsCode2D16;
        } else if (dimension === "3") {
            code = bitLength === "64" ? magicBitsCode3D64 :
                   bitLength === "32" ? magicBitsCode3D32 : magicBitsCode3D16;
        }
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
        <pre><code class="language-javascript">${code}</code></pre>
        `;
    button.classList.add("hidden");
    Prism.highlightAll();
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

function handleDimensionOrBitLengthChange() {
    // Finde alle Code-Container, Header und Result-Container
    const codeContainers = document.querySelectorAll('.code-container');
    const headers = document.querySelectorAll('.header-section');
    const resultContainers = document.querySelectorAll('.result');
    const buttons = document.querySelectorAll('.show-code-btn');

    codeContainers.forEach((codeContainer, index) => {
        // Überprüfen, ob der Container sichtbar ist
        if (!codeContainer.classList.contains("hidden")) {
            const headerId = headers[index]?.id;
            const resultId = resultContainers[index]?.id;
            const buttonId = buttons[index=== 0 ? 1 : 0]?.id;
            if (headerId && resultId && buttonId) {
                // Rufe closeCode mit den entsprechenden IDs auf
                console.log("rufe closecode(" + codeContainer.id, headerId, resultId, buttonId + "auf" )
                closeCode(codeContainer.id, headerId, resultId, buttonId);
            }
        }
    });
}

// Ergänze die Event-Listener für die Dropdowns
document.getElementById('bitLength').addEventListener('change', handleDimensionOrBitLengthChange);
document.getElementById('dimension').addEventListener('change', handleDimensionOrBitLengthChange);


// --------------------------------------------------------- Addition und Subtraktion -----------------------------------------------------------------------

function displayCoordinatesAndMorton(point, dimension, layout, bitLength, resultContainerId) {
    const coords = [point.x, point.y, point.z].slice(0, dimension === 3 ? 3 : 2);

    // Formatierte Binärdarstellung erstellen
    let binaryCoordinates = '';
    for (let i = 0; i < coords.length; i++) {
        const coord = coords[i];
        const colorClass = i === 0 ? 'color-x' : i === 1 ? 'color-y' : 'color-z'; // Farben basierend auf Index
        const binaryString = coord.toString(2).padStart(bitLength / dimension, '0');

        let formattedBits = '';
        for (let bitIndex = 0; bitIndex < binaryString.length; bitIndex++) {
            formattedBits += `<span class="${colorClass}">${binaryString[bitIndex]}</span>`; // Bits einfärben
        }

        binaryCoordinates += `<div class="binary">${layout[i]} = ${formattedBits} (decimal: ${coord})</div>`;
    }

    // Ergebnis in den Container einfügen
    document.getElementById(resultContainerId).innerHTML += `<p>point ${point.id}:</p>${binaryCoordinates}<p>morton code: ${point.mortonCode.toString(2)} (decimal: ${point.mortonCode})</p><br>`;
}

function checkMortonCodesExist(errorElementId) {
    const error = document.getElementById(errorElementId);

    console.log(pointA.mortonCode);
    console.log(pointB.mortonCode);

    // Überprüfe explizit, ob der Morton-Code `null` oder `undefined` ist
    if (pointA.mortonCode === null || pointA.mortonCode === undefined || 
        pointB.mortonCode === null || pointB.mortonCode === undefined) {
        error.textContent = "Please calculate Morton Codes for points A and B!";
        error.style.display = "block";
        return false;
    } else {
        error.textContent = "";
        error.style.display = "none";
        return true;
    }
}


function addition() {
    // Ergebnisse zurücksetzen
    document.getElementById(`resultAddition`).innerHTML = " ";

    if (!checkMortonCodesExist('additionError')) {
        console.log("morton code does not exist")
        return;
    }

    const dimension = parseInt(document.getElementById("dimension").value); 
    const bitLength = parseInt(document.getElementById("bitLength").value); 
    const layout = document.getElementById("layout").value;

    let sum;
    if (dimension === 2) {
        const x2_mask = 0xAAAAAAAAAAAAAAAAn;
        const y2_mask = 0x5555555555555555n;

        const x_sum = (pointA.mortonCode | y2_mask) + (pointB.mortonCode & x2_mask);
        const y_sum = (pointA.mortonCode | x2_mask) + (pointB.mortonCode & y2_mask);
        sum = (x_sum & x2_mask) | (y_sum & y2_mask);

    } else if (dimension === 3) {
        const x3_mask = 0x4924924924924924n;
        const y3_mask = 0x2492492492492492n;
        const z3_mask = 0x9249249249249249n;
        const xy3_mask = x3_mask | y3_mask;
        const xz3_mask = x3_mask | z3_mask;
        const yz3_mask = y3_mask | z3_mask;

        const x_sum = (pointA.mortonCode | yz3_mask) + (pointB.mortonCode & x3_mask);
        const y_sum = (pointA.mortonCode | xz3_mask) + (pointB.mortonCode & y3_mask);
        const z_sum = (pointA.mortonCode | xy3_mask) + (pointB.mortonCode & z3_mask);
        sum = (x_sum & x3_mask) | (y_sum & y3_mask) | (z_sum & z3_mask);
    } else {
        document.getElementById(`resultAddition`).innerHTML = "Invalid dimension!";
        return;
    }

    // Koordinaten und Morton-Codes der Punkte anzeigen
    displayCoordinatesAndMorton(pointA, dimension, layout, bitLength, 'resultAddition');
    displayCoordinatesAndMorton(pointB, dimension, layout, bitLength, 'resultAddition');

    // Ergebnisse anzeigen
    document.getElementById(`resultAddition`).innerHTML += 
        `<strong>a + b = ${sum.toString(2)} (decimal: ${sum}) </strong>`;
}


function subtraction() {
    // Ergebnisse zurücksetzen
    document.getElementById(`resultSubtraction`).innerHTML = " ";

    if (!checkMortonCodesExist('subtractionError')) {
        console.log("morton code does not exist")
        return;
    }

    if (checkCoordinatesForSubtraction() === false) {
        console.log("No subtraction!");
        return;
    }

    const dimension = parseInt(document.getElementById("dimension").value); 
    const bitLength = parseInt(document.getElementById("bitLength").value); 
    const layout = document.getElementById("layout").value;

    let diff;
    if (dimension === 2) {
        const x2_mask = 0xAAAAAAAAAAAAAAAAn;
        const y2_mask = 0x5555555555555555n;

        const x_diff = (pointA.mortonCode & x2_mask) - (pointB.mortonCode & x2_mask);
        const y_diff = (pointA.mortonCode & y2_mask) - (pointB.mortonCode & y2_mask);
        diff = (x_diff & x2_mask) | (y_diff & y2_mask);

    } else if (dimension === 3) {
        const x3_mask = 0x4924924924924924n;
        const y3_mask = 0x2492492492492492n;
        const z3_mask = 0x9249249249249249n;

        const x_diff = (pointA.mortonCode & x3_mask) - (pointB.mortonCode & x3_mask);
        const y_diff = (pointA.mortonCode & y3_mask) - (pointB.mortonCode & y3_mask);
        const z_diff = (pointA.mortonCode & z3_mask) - (pointB.mortonCode & z3_mask);
        diff = (x_diff & x3_mask) | (y_diff & y3_mask) | (z_diff & z3_mask);
    } else {
        document.getElementById(`resultSubtraction`).innerHTML = "Invalid dimension!";
        return;
    }

    // Koordinaten und Morton-Codes der Punkte anzeigen
    displayCoordinatesAndMorton(pointA, dimension, layout, bitLength, 'resultSubtraction');
    displayCoordinatesAndMorton(pointB, dimension, layout, bitLength, 'resultSubtraction');

    document.getElementById(`resultSubtraction`).innerHTML += 
        `<p><strong>a - b = ${diff.toString(2)} (decimal: ${diff}) </strong></p>`;
}


function checkCoordinatesForSubtraction() {
    const error = document.getElementById(`subtractionError`);

    if (pointA.x < pointB.x || pointA.y < pointB.y || (pointA.z && pointB.z && pointA.z < pointB.z)) {
        error.textContent = "Each coordinate of A must be ≥ the corresponding coordinate of B!";
        error.style.display = "block";
        return false;
    }

    error.textContent = "";
    error.style.display = "none";
    return true;
}


//--------------------------------------------------------- stencil -------------------------------------------------------------

// Funktion, um den 9-Punkte-Stencil zu zeichnen
function generateStencil(pointId) {
    const canvas = document.getElementById(`canvasStencil-${pointId}`);
    if (!canvas) {
        console.error('Canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Canvas context not found');
        return;
    }


    // Rücksetzen aller Transformationen und Inhalte
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Rücksetzt die Skalierung und Verschiebung
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Löscht den Canvas-Inhalt
 
    ctx.scale(2, 2); // skaliert das bild (für höhere auflösung)

    const dimension = BigInt(document.getElementById("dimension").value);

    if (pointId == 'a') {
        if (dimension == 2){
            generateStencil2D(canvas, ctx, pointA);
        } else if (dimension == 3){
            generateStencil3D(canvas, ctx, pointA);
        }
    }

    if (pointId == 'b') {
        if (dimension == 2){
            generateStencil2D(canvas, ctx, pointB);
        } else if (dimension == 3){
            generateStencil3D(canvas, ctx, pointB);
        }
    }
}

function generateStencil2D(canvas, ctx, pointId){
    const centerX = 150;
    const centerY = canvas.height / 4;
    const offset = 80; // Abstand zwischen den Punkten

    const points = [
        { x: pointId.x - 1, y: pointId.y - 1 },
        { x: pointId.x, y: pointId.y - 1 },
        { x: pointId.x + 1, y: pointId.y - 1 },
        { x: pointId.x - 1, y: pointId.y },
        { x: pointId.x, y: pointId.y }, // Mittelpunkt
        { x: pointId.x + 1, y: pointId.y },
        { x: pointId.x - 1, y: pointId.y + 1 },
        { x: pointId.x, y: pointId.y + 1 },
        { x: pointId.x + 1, y: pointId.y + 1 }
    ];

    // Farben und Stile anpassen
    const lineColor = '#000000'; // Schwarz
    const circleColor = '#000000'; // schwarz
    const textColor = '#000000'; // Schwarz

    // Zeichne Punkte und Verbindungen
    ctx.font = '9px Helvetica';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Verbindungen zeichnen
    ctx.strokeStyle = lineColor;
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const px = centerX + (point.x - pointId.x) * offset;
        const py = centerY + (point.y - pointId.y) * offset;

        // Horizontale Verbindungen
        if (i % 3 !== 2) { // Keine Verbindung rechts vom letzten Punkt in einer Zeile
            const rightPoint = points[i + 1];
            const pxRight = centerX + (rightPoint.x - pointId.x) * offset;
            const pyRight = centerY + (rightPoint.y - pointId.y) * offset;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(pxRight, pyRight);
            ctx.stroke();
        }

        // Vertikale Verbindungen
        if (i < 6) { // Keine Verbindung unterhalb der letzten Zeile
            const bottomPoint = points[i + 3];
            const pxBottom = centerX + (bottomPoint.x - pointId.x) * offset;
            const pyBottom = centerY + (bottomPoint.y - pointId.y) * offset;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(pxBottom, pyBottom);
            ctx.stroke();
        }
    }

    // Zeichne Punkte und Koordinaten
    points.forEach((point) => {
        const px = centerX + (point.x - pointId.x) * offset;
        const py = centerY + (point.y - pointId.y) * offset;

        // Zeichne Kreis
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, 2 * Math.PI);
        ctx.fillStyle = circleColor;
        ctx.fill();

        // Zeichne Koordinaten
        ctx.fillStyle = textColor;
        ctx.fillText(`(${point.x}, ${point.y})`, px, py + 25);
        
    });


    // Morton-Codes für 2D-Stencil ausgeben
    outputMortonCodes(points, pointId);
}



function generateStencil3D(canvas, ctx, pointId) {
    const centerX = 130;
    const centerY = 195;
    const offset = 90; // Abstand zwischen den Punkten
    const layerOffsetX = 250; // Abstand zwischen den Lagen
    const layerOffsetY = 40;

    // Punkte in drei Lagen definieren
    const layers = [
        pointId.z - 1,
        pointId.z,
        pointId.z + 1
    ];

    let layerCenters = [];

    layers.forEach((z, layerIndex) => {
        const layerCenterX = centerX + layerIndex * layerOffsetX;
        const layerCenterY = centerY - layerIndex * layerOffsetY;
        layerCenters.push({ x: layerCenterX, y: layerCenterY }); // Speichere die Mittelpunkte der Lagen

        const points = [
            { x: pointId.x - 1, y: pointId.y - 1 },
            { x: pointId.x, y: pointId.y - 1 },
            { x: pointId.x + 1, y: pointId.y - 1 },
            { x: pointId.x - 1, y: pointId.y },
            { x: pointId.x, y: pointId.y }, // Mittelpunkt
            { x: pointId.x + 1, y: pointId.y },
            { x: pointId.x - 1, y: pointId.y + 1 },
            { x: pointId.x, y: pointId.y + 1 },
            { x: pointId.x + 1, y: pointId.y + 1 }
        ];

        //outputMortonCodes(points, pointId);

        // Farben und Stile anpassen
        const lineColor = '#000000'; // Schwarz
        const circleColor = '#000'; // schwarz
        const textColor = '#000000'; // Schwarz

        ctx.font = '9px Helvetica';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Verbindungen zeichnen
        ctx.strokeStyle = lineColor;
        points.forEach((point, i) => {
            const px = layerCenterX + (point.x - pointId.x) * offset;
            const py = layerCenterY + (point.y - pointId.y) * offset;

            // Horizontale Verbindungen
            if (i % 3 !== 2) {
                const rightPoint = points[i + 1];
                const pxRight = layerCenterX + (rightPoint.x - pointId.x) * offset;
                const pyRight = layerCenterY + (rightPoint.y - pointId.y) * offset;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(pxRight, pyRight);
                ctx.stroke();
            }

            // Vertikale Verbindungen
            if (i < 6) {
                const bottomPoint = points[i + 3];
                const pxBottom = layerCenterX + (bottomPoint.x - pointId.x) * offset;
                const pyBottom = layerCenterY + (bottomPoint.y - pointId.y) * offset;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(pxBottom, pyBottom);
                ctx.stroke();
            }
        });


        // Punkte und Koordinaten zeichnen
        points.forEach((point) => {
            const px = layerCenterX + (point.x - pointId.x) * offset;
            const py = layerCenterY + (point.y - pointId.y) * offset;

            // Kreis zeichnen
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, 2 * Math.PI);
            ctx.fillStyle = circleColor;
            ctx.fill();

            // Koordinaten zeichnen
            ctx.fillStyle = textColor;
            ctx.fillText(`(${point.x}, ${point.y}, ${z})`, px, py + 25);
        });
    });

     // Zeichne Linie vom Mittelpunkt der ersten Lage zum Mittelpunkt der letzten Lage
     const firstCenter = layerCenters[0];
     const lastCenter = layerCenters[2];
     ctx.strokeStyle = '#000'; 
     ctx.setLineDash([5, 5]); // Linie gestrichelt: 10 Pixel Linie, 5 Pixel Lücke
     ctx.beginPath();
     ctx.moveTo(firstCenter.x, firstCenter.y);
     ctx.lineTo(lastCenter.x, lastCenter.y);
     ctx.stroke();
     ctx.setLineDash([]); // Rücksetzen auf durchgehende Linie
}

// Funktion, um die Morton-Codes der Punkte des Stencils auszugeben
function outputMortonCodes(points, pointId) {
    document.getElementById(`stencilResult-${pointId.id}`).innerHTML = '';
    const bitLength = parseInt(document.getElementById("bitLength").value);
    const dimension = parseInt(document.getElementById("dimension").value);
    console.log(`Morton-Codes für Stencil-Punkte (${pointId.id}):`);
    points.forEach((point) => {
        const { mortonCode, steps } = dimension === 2
        ? mortonEncodeMagicBits2D(point.x, point.y, bitLength)
        : mortonEncodeMagicBits3D(point.x, point.y, point.z, bitLength);
        console.log(`Point (${point.x}, ${point.y}): Morton Code = ${mortonCode.toString(2)}`);

        document.getElementById(`stencilResult-${pointId.id}`).innerHTML += 
        `point (${point.x}, ${point.y}): Morton Code = ${mortonCode.toString(2)} (decimal:${mortonCode}) <br><br>`;
    });
}
   
