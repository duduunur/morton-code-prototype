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
    // get bit length, dimension and maxCoord element
    const bitLength = BigInt(document.getElementById("bitLength").value);
    const dimension = BigInt(document.getElementById("dimension").value);
    const maxCoord = document.getElementById("maxCoord");

    //calculate maxCoord
    maxCoordinateValue = (1n << (bitLength / dimension)) - 1n; //1n << x verschiebt die Zahl 1 um x Bit nach links, was äquivalent zu 2^x ist 

    // display max coord
    maxCoord.innerText = `Maximum Coordinate Value: ${maxCoordinateValue.toString()}`;
}

function clearContainers() {
    // Ergebnis Container und Error container leeren
    document.getElementById(`a-resultForLoop`).innerHTML = '';
    document.getElementById(`a-resultMagicBits`).innerHTML = '';
    document.getElementById(`b-resultForLoop`).innerHTML = '';
    document.getElementById(`b-resultMagicBits`).innerHTML = '';

    clearCoordinateInputs('a');
    clearCoordinateInputs('b');

    document.getElementById(`a-xError`).innerHTML = '';
    document.getElementById(`a-x`).classList.remove('input-error');
    document.getElementById(`a-yError`).innerHTML = '';
    document.getElementById(`a-y`).classList.remove('input-error');
    document.getElementById(`a-zError`).innerHTML = '';
    document.getElementById(`a-z`).classList.remove('input-error');

    document.getElementById(`b-xError`).innerHTML = '';
    document.getElementById(`b-x`).classList.remove('input-error');
    document.getElementById(`b-yError`).innerHTML = '';
    document.getElementById(`b-y`).classList.remove('input-error');
    document.getElementById(`b-zError`).innerHTML = '';
    document.getElementById(`b-z`).classList.remove('input-error');

    clearStencil('a');
    clearStencil('b');

    document.getElementById(`resultAddition`).innerHTML = '';
    document.getElementById(`resultSubtraction`).innerHTML = '';
    document.getElementById(`additionError`).innerHTML = '';
    document.getElementById(`subtractionError`).innerHTML = '';

    // Point Container höhe zurücksetzen und nicht mehr resizable 
    document.getElementById(`point-a`).style.removeProperty('height');
    document.getElementById(`point-b`).style.removeProperty('height');
    document.getElementById(`point-a`).style.resize = 'none';
    document.getElementById(`point-b`).style.resize = 'none';

    // Werte in den Objekten zurücksetzen
    pointA.x = null;
    pointA.y = null;
    pointA.z = null;
    pointA.mortonCode = null;
    
    pointB.x = null;
    pointB.y = null;
    pointB.z = null;
    pointB.mortonCode = null;
}

function clearCoordinateInputs(pointId) {
    //console.log("clearCoordinateinputs aufgerufen für point" + pointId)
    document.getElementById(`${pointId}-x`).value = "";
    document.getElementById(`${pointId}-y`).value = "";
    const zInput = document.getElementById(`${pointId}-z`);
    if (zInput) {
        zInput.value = "";
    }
}

function checkCoordinateLimits(pointId) {
    const xInput = document.getElementById(`${pointId}-x`);
    const yInput = document.getElementById(`${pointId}-y`);
    const zInput = document.getElementById(`${pointId}-z`);
    const zInputContainer = document.getElementById(`${pointId}-zInput`);

    const xError = document.getElementById(`${pointId}-xError`);
    const yError = document.getElementById(`${pointId}-yError`);
    const zError = document.getElementById(`${pointId}-zError`);

    const x = xInput && xInput.value ? xInput.value : null; //brauche ich das? 
    const y = yInput && yInput.value ? yInput.value : null;
    const z = zInput && zInput.value ? zInput.value : null;

    //console.log("x:" + x);
    //console.log("y:" + y);
    //console.log("z:" + z);

    let hasError = false;

    // Helper function for invalid input
    function isInvalidCoordinate(value) {
        return isNaN(value) || value.includes(".") || value < 0;
    }

    // Validate X
    if (x == null || isInvalidCoordinate(x) || BigInt(x) > maxCoordinateValue) {
        xInput.classList.add('input-error');
        xError.textContent = "Enter an integer between 0 and "+ maxCoordinateValue;
        xError.style.display = "block";
        hasError = true;
    } else {
        xInput.classList.remove('input-error');
        xError.textContent = "";
        xError.style.display = "none";
    }

    // Validate Y
    if (y == null || isInvalidCoordinate(y) || BigInt(y) > maxCoordinateValue) {
        yInput.classList.add('input-error');
        yError.textContent = "Enter an integer between 0 and "+ maxCoordinateValue;
        yError.style.display = "block";
        hasError = true;
    } else {
        yInput.classList.remove('input-error');
        yError.textContent = "";
        yError.style.display = "none";
    }

    // Validate Z (if present)
    if (!zInputContainer.classList.contains("hidden")) {
        if (z == null || isInvalidCoordinate(z) || BigInt(z) > maxCoordinateValue) {
            zInput.classList.add('input-error');
            zError.textContent = "Enter an integer between 0 and "+ maxCoordinateValue;
            zError.style.display = "block";
            hasError = true;
        } else {
            zInput.classList.remove('input-error');
            zError.textContent = "";
            zError.style.display = "none";
        }
    }

    return !hasError;
}

function toggleCoordinateFields(pointId) {
    //console.log("toggle aufgerufen")
    const dimension = document.getElementById("dimension").value;
    const layout = document.getElementById("layout");
    const layoutContainer = document.getElementById("layoutContainer");
    const zInput = document.getElementById(`${pointId}-zInput`);
    const zLabel = document.getElementById(`${pointId}-zLabel`);
    const zError = document.getElementById(`${pointId}-zError`);

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
    clearContainers();
    toggleCoordinateFields('a'); 
    toggleCoordinateFields('b');
    displayMaxCoord();
    closeCode('a-forLoopCodeContainer', 'a-magicBitsHeader', 'a-show-code-btn', 'a-resultMagicBits'); // to-do: prüfen, ob offen 
    closeCode('a-magicBitsCodeContainer', 'a-forLoopHeader','a-show-code-btn2','a-resultForLoop');// to-do: prüfen, ob offen 
    closeCode('b-forLoopCodeContainer', 'b-magicBitsHeader', 'b-show-code-btn', 'b-resultMagicBits'); // to-do: prüfen, ob offen 
    closeCode('b-magicBitsCodeContainer', 'b-forLoopHeader','b-show-code-btn2','b-resultForLoop');// to-do: prüfen, ob offen 
}

function clearStencil(pointId) {
    document.getElementById(`stencilContainer-${pointId}`).classList.remove('expanded');

    const canvas = document.getElementById(`canvasStencil-${pointId}`);
    const resultDiv = document.getElementById(`stencilResult-${pointId}`);
    
    // Canvas leeren
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Inhalt des resultDiv leeren
    if (resultDiv) {
        resultDiv.innerHTML = '';
    }
}

// -------------------------------------------------- Calculate Morton Code --------------------------------------------------------------

function calculateMortonCode(pointId) {
    // Ergebnisse zurücksetzen
    document.getElementById(`${pointId}-resultForLoop`).innerHTML = '';
    document.getElementById(`${pointId}-resultMagicBits`).innerHTML = '';

    document.getElementById(`point-${pointId}`).style.removeProperty('height');
    document.getElementById(`point-${pointId}`).style.resize = 'none';

    clearStencil(pointId) 

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

    generateStencil(`${pointId}`);
}

// ---------------------------------------------- Interleave mit For-Schleife ----------------------------------------------------------


function interleaveForLoop(coords, bitLength, layout, pointId) {
    let mortonCode = BigInt(0);
    //console.log(coords)
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
        bitSteps += `<h5>Bits for ${layout[i]}:</h5>`;
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
        <h5>Combination:</h5>
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


function showSourceCode(codeContainerId, HeaderId, buttonId, resultContainerId, code) {
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

    // make source code container visible 
    codeContainer.classList.remove("hidden");

    // hide header, result and show source code button 
    headerContainer.classList.add("hidden");
    resultContainer.classList.add("hidden");
    button.classList.add("hidden");

    // fill the source code container
    codeContainer.innerHTML = `
        <button class="close-btn" onclick="closeCode('${codeContainerId}', '${HeaderId}', '${resultContainerId}', '${buttonId}')">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        </button>
        <pre><code class="language-javascript">${code}</code></pre>
        `;
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
    document.getElementById(resultContainerId).innerHTML += `<p>point ${point.id}:</p>${binaryCoordinates}<p>morton code: ${point.mortonCode.toString(2).padStart(bitLength, '0')} (decimal: ${point.mortonCode})</p><br>`;
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
    const resultElement = document.getElementById(`resultAddition`);
    resultElement.innerHTML = "";

    if (!checkMortonCodesExist('additionError')) {
        console.log("Morton code does not exist");
        return;
    }
    if (!checkCoordinatesForAddition()) {
        console.log("out of range");
        return;
    }

    const dimension = parseInt(document.getElementById("dimension").value);
    const bitLength = parseInt(document.getElementById("bitLength").value);
    const layout = document.getElementById("layout").value;

    let sum;
    let steps = ""; // String to hold the calculation steps

    // Helper function to generate masks dynamically
    function generateMask(pattern, bitLength) {
        let mask = 0n;
        for (let i = 0; i < bitLength; i += pattern.length) {
            for (let j = 0; j < pattern.length; j++) {
                if (i + j < bitLength && pattern[j] === "1") {
                    mask |= 1n << BigInt(i + j);
                }
            }
        }
        return mask;
    }

    if (dimension === 2) {
        // Generate masks for 2D
        const x2_mask = generateMask("10", bitLength);
        const y2_mask = generateMask("01", bitLength);

        steps += `<h5>Calculation: </h5>`;
        steps += `<h5>Masks: </h5>
        <div class="binary">X-mask: 0x${x2_mask.toString(16).toUpperCase()}<br>
        Y-mask: 0x${y2_mask.toString(16).toUpperCase()}</div>`;

        const x_sum = (pointA.mortonCode | y2_mask) + (pointB.mortonCode & x2_mask);
        steps += `<h5>X-sum calculation: </h5><div class="binary">(pointA | Y-mask) + (pointB & X-mask):<br><br>
        ${pointA.mortonCode.toString(2).padStart(bitLength, '0')} | ${y2_mask.toString(2).padStart(bitLength, '0')} + ${pointB.mortonCode.toString(2).padStart(bitLength, '0')} & ${x2_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${x_sum.toString(2).padStart(bitLength, '0')}</div>`;

        const y_sum = (pointA.mortonCode | x2_mask) + (pointB.mortonCode & y2_mask);
        steps += `<h5>Y-sum calculation: </h5><div class="binary">(pointA | X-mask) + (pointB & Y-mask):<br><br>
        ${pointA.mortonCode.toString(2).padStart(bitLength, '0')} | ${x2_mask.toString(2).padStart(bitLength, '0')} + ${pointB.mortonCode.toString(2).padStart(bitLength, '0')} & ${y2_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${y_sum.toString(2).padStart(bitLength, '0')}</div>`;

        sum = (x_sum & x2_mask) | (y_sum & y2_mask);
        steps += `<h5>Final sum:</h5><div class="binary">(X-sum & X-mask) | (Y-sum & Y-mask):<br><br>
        ${x_sum.toString(2).padStart(bitLength, '0')} & ${x2_mask.toString(2).padStart(bitLength, '0')} | ${y_sum.toString(2).padStart(bitLength, '0')} & ${y2_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${sum.toString(2).padStart(bitLength, '0')}</div><br><br>`;

    } else if (dimension === 3) {
        // Generate masks for 3D
        const x3_mask = generateMask("100", bitLength);
        const y3_mask = generateMask("010", bitLength);
        const z3_mask = generateMask("001", bitLength);
        const xy3_mask = x3_mask | y3_mask;
        const xz3_mask = x3_mask | z3_mask;
        const yz3_mask = y3_mask | z3_mask;

        steps += `<h5>Calculation: </h5>`;
        steps += `<h5>Masks: </h5>
        <div class="binary">X-mask: 0x${x3_mask.toString(16).toUpperCase()}<br>
        Y-mask: 0x${y3_mask.toString(16).toUpperCase()}<br>
        Z-mask: 0x${z3_mask.toString(16).toUpperCase()}</div>`;

        const x_sum = (pointA.mortonCode | yz3_mask) + (pointB.mortonCode & x3_mask);
        steps += `<h5>X-sum calculation: </h5><div class="binary">(pointA | YZ-mask) + (pointB & X-mask):<br><br>
        ${pointA.mortonCode.toString(2).padStart(bitLength, '0')} | ${yz3_mask.toString(2).padStart(bitLength, '0')} + ${pointB.mortonCode.toString(2).padStart(bitLength, '0')} & ${x3_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${x_sum.toString(2).padStart(bitLength, '0')}</div>`;

        const y_sum = (pointA.mortonCode | xz3_mask) + (pointB.mortonCode & y3_mask);
        steps += `<h5>Y-sum calculation: </h5><div class="binary">(pointA | XZ-mask) + (pointB & Y-mask):<br><br>
        ${pointA.mortonCode.toString(2).padStart(bitLength, '0')} | ${xz3_mask.toString(2).padStart(bitLength, '0')} + ${pointB.mortonCode.toString(2).padStart(bitLength, '0')} & ${y3_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${y_sum.toString(2).padStart(bitLength, '0')}</div>`;

        const z_sum = (pointA.mortonCode | xy3_mask) + (pointB.mortonCode & z3_mask);
        steps += `<h5>Z-sum calculation: </h5><div class="binary">(pointA | XY-mask) + (pointB & Z-mask):<br><br>
        ${pointA.mortonCode.toString(2).padStart(bitLength, '0')} | ${xy3_mask.toString(2).padStart(bitLength, '0')} + ${pointB.mortonCode.toString(2).padStart(bitLength, '0')} & ${z3_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${z_sum.toString(2).padStart(bitLength, '0')}</div>`;

        sum = (x_sum & x3_mask) | (y_sum & y3_mask) | (z_sum & z3_mask);
        steps += `<h5>Final sum: </h5><div class="binary">(X-sum & X-mask) | (Y-sum & Y-mask) | (Z-sum & Z-mask):<br><br>
        ${x_sum.toString(2).padStart(bitLength, '0')} & ${x3_mask.toString(2).padStart(bitLength, '0')} | ${y_sum.toString(2).padStart(bitLength, '0')} & ${y3_mask.toString(2).padStart(bitLength, '0')} | ${z_sum.toString(2).padStart(bitLength, '0')} & ${z3_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${sum.toString(2).padStart(bitLength, '0')}</div><br><br>`;
    } else {
        resultElement.innerHTML = "<p>Invalid dimension!</p>";
        return;
    }

    // Koordinaten und Morton-Codes der Punkte anzeigen
    displayCoordinatesAndMorton(pointA, dimension, layout, bitLength, 'resultAddition');
    displayCoordinatesAndMorton(pointB, dimension, layout, bitLength, 'resultAddition');

    // Ergebnisse und Schritte anzeigen
    resultElement.innerHTML += steps;
    resultElement.innerHTML += `<strong>result:<br><br>a + b = ${sum.toString(2).padStart(bitLength, '0')} (decimal: ${sum}) </strong>`;
}




function subtraction() {
    // Ergebnisse zurücksetzen
    const resultElement = document.getElementById(`resultSubtraction`);
    resultElement.innerHTML = "";

    if (!checkMortonCodesExist('subtractionError')) {
        console.log("Morton code does not exist");
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
    let steps = ""; // String to hold the calculation steps

    // Helper function to generate masks dynamically
    function generateMask(pattern, bitLength) {
        let mask = 0n;
        for (let i = 0; i < bitLength; i += pattern.length) {
            for (let j = 0; j < pattern.length; j++) {
                if (i + j < bitLength && pattern[j] === "1") {
                    mask |= 1n << BigInt(i + j);
                }
            }
        }
        return mask;
    }

    if (dimension === 2) {
        // Generate masks for 2D
        const x2_mask = generateMask("10", bitLength);
        const y2_mask = generateMask("01", bitLength);

        steps += `<h5>Calculation: </h5>`;
        steps += `<h5>Masks: </h5>
        <div class="binary">X-mask: 0x${x2_mask.toString(16).toUpperCase()}<br>
        Y-mask: 0x${y2_mask.toString(16).toUpperCase()}</div>`;

        const x_diff = (pointA.mortonCode & x2_mask) - (pointB.mortonCode & x2_mask);
        steps += `<h5>X-diff calculation: </h5><div class="binary">(pointA & X-mask) - (pointB & X-mask):<br><br>
        ${pointA.mortonCode.toString(2).padStart(bitLength, '0')} & ${x2_mask.toString(2).padStart(bitLength, '0')} - ${pointB.mortonCode.toString(2).padStart(bitLength, '0')} & ${x2_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${x_diff.toString(2).padStart(bitLength, '0')}</div>`;

        const y_diff = (pointA.mortonCode & y2_mask) - (pointB.mortonCode & y2_mask);
        steps += `<h5>Y-diff calculation: </h5><div class="binary">(pointA & Y-mask) - (pointB & Y-mask):<br><br>
        ${pointA.mortonCode.toString(2).padStart(bitLength, '0')} & ${y2_mask.toString(2).padStart(bitLength, '0')} - ${pointB.mortonCode.toString(2).padStart(bitLength, '0')} & ${y2_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${y_diff.toString(2).padStart(bitLength, '0')}</div>`;

        diff = (x_diff & x2_mask) | (y_diff & y2_mask);
        steps += `<h5>Final diff:</h5><div class="binary">(X-diff & X-mask) | (Y-diff & Y-mask):<br><br>
        ${x_diff.toString(2).padStart(bitLength, '0')} & ${x2_mask.toString(2).padStart(bitLength, '0')} | ${y_diff.toString(2).padStart(bitLength, '0')} & ${y2_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${diff.toString(2).padStart(bitLength, '0')}</div><br><br>`;

    } else if (dimension === 3) {
        // Generate masks for 3D
        const x3_mask = generateMask("100", bitLength);
        const y3_mask = generateMask("010", bitLength);
        const z3_mask = generateMask("001", bitLength);

        steps += `<h5>Calculation: </h5>`;
        steps += `<h5>Masks: </h5>
        <div class="binary">X-mask: 0x${x3_mask.toString(16).toUpperCase()}<br>
        Y-mask: 0x${y3_mask.toString(16).toUpperCase()}<br>
        Z-mask: 0x${z3_mask.toString(16).toUpperCase()}</div>`;

        const x_diff = (pointA.mortonCode & x3_mask) - (pointB.mortonCode & x3_mask);
        steps += `<h5>X-diff calculation: </h5><div class="binary">(pointA & X-mask) - (pointB & X-mask):<br><br>
        ${pointA.mortonCode.toString(2).padStart(bitLength, '0')} & ${x3_mask.toString(2).padStart(bitLength, '0')} - ${pointB.mortonCode.toString(2).padStart(bitLength, '0')} & ${x3_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${x_diff.toString(2).padStart(bitLength, '0')}</div>`;

        const y_diff = (pointA.mortonCode & y3_mask) - (pointB.mortonCode & y3_mask);
        steps += `<h5>Y-diff calculation: </h5><div class="binary">(pointA & Y-mask) - (pointB & Y-mask):<br><br>
        ${pointA.mortonCode.toString(2).padStart(bitLength, '0')} & ${y3_mask.toString(2).padStart(bitLength, '0')} - ${pointB.mortonCode.toString(2).padStart(bitLength, '0')} & ${y3_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${y_diff.toString(2).padStart(bitLength, '0')}</div>`;

        const z_diff = (pointA.mortonCode & z3_mask) - (pointB.mortonCode & z3_mask);
        steps += `<h5>Z-diff calculation: </h5><div class="binary">(pointA & Z-mask) - (pointB & Z-mask):<br><br>
        ${pointA.mortonCode.toString(2).padStart(bitLength, '0')} & ${z3_mask.toString(2).padStart(bitLength, '0')} - ${pointB.mortonCode.toString(2).padStart(bitLength, '0')} & ${z3_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${z_diff.toString(2).padStart(bitLength, '0')}</div>`;

        diff = (x_diff & x3_mask) | (y_diff & y3_mask) | (z_diff & z3_mask);
        steps += `<h5>Final diff: </h5><div class="binary">(X-diff & X-mask) | (Y-diff & Y-mask) | (Z-diff & Z-mask):<br><br>
        ${x_diff.toString(2).padStart(bitLength, '0')} & ${x3_mask.toString(2).padStart(bitLength, '0')} | ${y_diff.toString(2).padStart(bitLength, '0')} & ${y3_mask.toString(2).padStart(bitLength, '0')} | ${z_diff.toString(2).padStart(bitLength, '0')} & ${z3_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${diff.toString(2).padStart(bitLength, '0')}</div><br><br>`;
    } else {
        resultElement.innerHTML = "<p>Invalid dimension!</p>";
        return;
    }

    // Koordinaten und Morton-Codes der Punkte anzeigen
    displayCoordinatesAndMorton(pointA, dimension, layout, bitLength, 'resultSubtraction');
    displayCoordinatesAndMorton(pointB, dimension, layout, bitLength, 'resultSubtraction');

    // Ergebnisse und Schritte anzeigen
    resultElement.innerHTML += steps;
    resultElement.innerHTML += `<strong>result:<br><br>a - b = ${diff.toString(2).padStart(bitLength, '0')} (decimal: ${diff}) </strong>`;
}

function checkCoordinatesForAddition() {
    const error = document.getElementById(`additionError`);

    if (pointA.x + pointB.x > maxCoordinateValue || pointA.x + pointB.x > maxCoordinateValue || (pointA.z && pointB.z && pointA.z + pointB.z > maxCoordinateValue)) {
        error.textContent = `Each coordinate sum must be within the allowed range! (max allowed: ${maxCoordinateValue})`;
        error.style.display = "block";
        return false;
    }

    error.textContent = "";
    error.style.display = "none";
    return true;
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
    document.getElementById(`stencilContainer-${pointId}`).classList.add('expanded');

    console.log("generatestencil aufgerufen")
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
    canvas.width = 600;  // Ändert die interne Breite 
    canvas.height = 550;

    canvas.style.width = '300px';  // darstellungsgröße
    canvas.style.height = '275px'; 

    ctx.scale(2, 2); // skaliert das bild (für höhere auflösung)

    const centerX = canvas.width / 4;
    const centerY = canvas.height / 4;
    const offset = 80; // Abstand zwischen den Punkten

    const points = [
        { x: pointId.x - 1, y: pointId.y + 1 }, // oben links
        { x: pointId.x, y: pointId.y + 1 },     // oben mittig
        { x: pointId.x + 1, y: pointId.y + 1 }, // oben rechts
        { x: pointId.x - 1, y: pointId.y },     // mitte links
        { x: pointId.x, y: pointId.y },         // mitte
        { x: pointId.x + 1, y: pointId.y },     // mitte rechts
        { x: pointId.x - 1, y: pointId.y - 1 }, // unten links
        { x: pointId.x, y: pointId.y - 1 },     // unten mittig
        { x: pointId.x + 1, y: pointId.y - 1 }  // unten rechts
    ];

    // Farben und Stile anpassen
    const lineColor = '#707070'; 
    const circleColor = '#303030'; 
    const centerColor = '#0C9329'; // grün
    const textColor = '#000'

    // Zeichne Punkte und Verbindungen
    ctx.font = '9px Helvetica';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Verbindungen zeichnen
    ctx.strokeStyle = lineColor;
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const px = centerX + (point.x - pointId.x) * offset;
        const py = centerY - (point.y - pointId.y) * offset; // Y invertiert für korrekte Darstellung

        // Horizontale Verbindungen
        if (i % 3 !== 2) { // Keine Verbindung rechts vom letzten Punkt in einer Zeile
            const rightPoint = points[i + 1];
            const pxRight = centerX + (rightPoint.x - pointId.x) * offset;
            const pyRight = centerY - (rightPoint.y - pointId.y) * offset;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(pxRight, pyRight);
            ctx.stroke();
        }

        // Vertikale Verbindungen
        if (i < 6) { // Keine Verbindung unterhalb der letzten Zeile
            const bottomPoint = points[i + 3];
            const pxBottom = centerX + (bottomPoint.x - pointId.x) * offset;
            const pyBottom = centerY - (bottomPoint.y - pointId.y) * offset;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(pxBottom, pyBottom);
            ctx.stroke();
        }
    }

    // Zeichne Punkte und Koordinaten
    points.forEach((point, index) => {
        const px = centerX + (point.x - pointId.x) * offset;
        const py = centerY - (point.y - pointId.y) * offset;

        // Zeichne Kreis
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, 2 * Math.PI);
        ctx.fillStyle = index === 4 ? centerColor : circleColor; // Mittelpunkt grün füllen
        ctx.fill();

        // Koordinaten zeichnen
        ctx.fillStyle = textColor;
        const adjustedPy = [1, 4, 7].includes(index) ? py - 10 : py; // 10 Pixel nach unten für Index 1, 4, 7
        ctx.fillText(`(${point.x}, ${point.y})`, px, adjustedPy + 25); 
    });


    // Morton-Codes für 2D-Stencil ausgeben
    outputMortonCodes(points, pointId);
}


// layout xyz 
function generateStencil3D(canvas, ctx, pointId) {
    canvas.width = 1700;  // Ändert die interne Breite 
    canvas.height = 700;

    canvas.style.width = '850px';  // darstellungsgröße
    canvas.style.height = '350px'; 

    ctx.scale(2, 2); // skaliert das bild (für höhere auflösung)
    const centerX = 170;
    const centerY = 200;
    const offset = 90; // Abstand zwischen den Punkten
    const layerOffsetX = 250; // Abstand zwischen den Lagen
    const layerOffsetY = 50;

    // Punkte in drei Lagen definieren
    const layers = [
        pointId.z + 1,
        pointId.z,
        pointId.z - 1
    ];

    let layerCenters = [];

    // Farben und Stile anpassen
    const lineColor = '#707070'; 
    const circleColor = '#303030'; 
    const centerColor = '#0C9329'; // grün
    const textColor = '#000'
    
    ctx.font = '9px Helvetica';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    layers.forEach((z, layerIndex) => {
        const layerCenterX = centerX + layerIndex * layerOffsetX;
        const layerCenterY = centerY - layerIndex * layerOffsetY;
        layerCenters.push({ x: layerCenterX, y: layerCenterY }); // Speichere die Mittelpunkte der Lagen

        const points = [
            { x: pointId.x - 1, y: pointId.y + 1 }, // oben links
            { x: pointId.x, y: pointId.y + 1 },     // oben mittig
            { x: pointId.x + 1, y: pointId.y + 1 }, // oben rechts
            { x: pointId.x - 1, y: pointId.y },     // mitte links
            { x: pointId.x, y: pointId.y },         // mitte
            { x: pointId.x + 1, y: pointId.y },     // mitte rechts
            { x: pointId.x - 1, y: pointId.y - 1 }, // unten links
            { x: pointId.x, y: pointId.y - 1 },     // unten mittig
            { x: pointId.x + 1, y: pointId.y - 1 }  // unten rechts
        ];

        // Verbindungen zeichnen
        ctx.strokeStyle = lineColor;
        points.forEach((point, i) => {
            const px = layerCenterX + (point.x - pointId.x) * offset;
            const py = layerCenterY - (point.y - pointId.y) * offset;

            // Horizontale Verbindungen
            if (i % 3 !== 2) {
                const rightPoint = points[i + 1];
                const pxRight = layerCenterX + (rightPoint.x - pointId.x) * offset;
                const pyRight = layerCenterY - (rightPoint.y - pointId.y) * offset;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(pxRight, pyRight);
                ctx.stroke();
            }

            // Vertikale Verbindungen
            if (i < 6) {
                const bottomPoint = points[i + 3];
                const pxBottom = layerCenterX + (bottomPoint.x - pointId.x) * offset;
                const pyBottom = layerCenterY - (bottomPoint.y - pointId.y) * offset;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(pxBottom, pyBottom);
                ctx.stroke();
            }
        });


        // Punkte und Koordinaten zeichnen
        points.forEach((point, index) => {
            const px = layerCenterX + (point.x - pointId.x) * offset;
            const py = layerCenterY - (point.y - pointId.y) * offset;

            // Kreis zeichnen
            ctx.beginPath();
            ctx.arc(px, py, 7, 0, 2 * Math.PI);
            ctx.fillStyle = (index === 4 && layerIndex === 1) ? centerColor : circleColor; // Mittelpunkt grün füllen
            ctx.fill();

            // Koordinaten zeichnen
            ctx.fillStyle = textColor;
            const adjustedPy = [1, 4, 7].includes(index) ? py - 10 : py; // 10 Pixel nach oben für Index 1, 4, 7
            ctx.fillText(`(${point.x}, ${point.y}, ${z})`, px + 2, adjustedPy + 25); 
        });
    });

     // Zeichne Linie vom Mittelpunkt der ersten Lage zum Mittelpunkt der letzten Lage
     const firstCenter = layerCenters[0];
     const lastCenter = layerCenters[2];
     ctx.strokeStyle = circleColor; 
     ctx.setLineDash([10, 10]); // Linie gestrichelt: 10 Pixel Linie, 10 Pixel Lücke
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
    //console.log(`Morton-Codes für Stencil-Punkte (${pointId.id}):`);

    document.getElementById(`stencilResult-${pointId.id}`).innerHTML += `<h4>Morton codes of neighboring points:</h4>`;

    points.forEach((point, index) => {
        const { mortonCode, steps } = dimension === 2
        ? mortonEncodeMagicBits2D(point.x, point.y, bitLength)
        : mortonEncodeMagicBits3D(point.x, point.y, point.z, bitLength);
        //console.log(`Point (${point.x}, ${point.y}): Morton Code = ${mortonCode.toString(2)}`);

        const colorStyle = index === 4 ? 'style="color: #0C9329;"' : '';

        document.getElementById(`stencilResult-${pointId.id}`).innerHTML += 
            `<p ${colorStyle}>point (${point.x}, ${point.y}): Morton Code = ${mortonCode.toString(2).padStart(bitLength, '0')} (decimal:${mortonCode})</p>`;
    });
}
   
