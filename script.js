// Globale Variablen
let bitLength = 16;  
let dimension = 2;    
let layout = "xyz";   

let maxCoordinateValue = 0n;

const pointA = {
    id: 'a',
    x: null,
    y: null,
    z: null, 
    mortonCode: null
};

const pointB = {
    id: 'b',
    x: null,
    y: null,
    z: null, 
    mortonCode: null
};

// --------------------------------------------------- handle settings and update page ---------------------------------------------------

function displayMaxCoord() {
    // get maxCoord html element
    maxCoordContainer = document.getElementById("maxCoord");

    //calculate maxCoord
    maxCoordinateValue = (1n << (BigInt(bitLength) / BigInt(dimension))) - 1n; //1n << x verschiebt die Zahl 1 um x Bit nach links, was äquivalent zu 2^x ist 

    // display max coord
    maxCoordContainer.innerText = `Maximum Coordinate Value: ${maxCoordinateValue.toString()}`;
}

function clearContainers() {
    // Ergebnis Container und Error container leeren
    document.getElementById(`a-resultForLoop`).innerHTML = '';
    document.getElementById(`a-resultMagicBits`).innerHTML = '';
    document.getElementById(`b-resultForLoop`).innerHTML = '';
    document.getElementById(`b-resultMagicBits`).innerHTML = '';

    clearCoordinateInputs(pointA);
    clearCoordinateInputs(pointB);

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

    clearStencil(pointA);
    clearStencil(pointB);

    document.getElementById(`resultAddition`).innerHTML = '';
    document.getElementById(`resultSubtraction`).innerHTML = '';
    document.getElementById(`additionError`).innerHTML = '';
    document.getElementById(`subtractionError`).innerHTML = '';
    document.getElementById(`resultAddition`).style.removeProperty('height');
    document.getElementById(`resultSubtraction`).style.removeProperty('height');
    document.getElementById(`resultAddition`).style.resize = 'none';
    document.getElementById(`resultSubtraction`).style.resize = 'none';

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

function clearCoordinateInputs(point) {
    //console.log("clearCoordinateinputs aufgerufen für point" + pointId)
    document.getElementById(`${point.id}-x`).value = "";
    document.getElementById(`${point.id}-y`).value = "";
    const zInput = document.getElementById(`${point.id}-z`);
    if (zInput) {
        zInput.value = "";
    }
}

function checkCoordinateLimits(point) {
    //console.log("checking coordinatelimits")
    const xInput = document.getElementById(`${point.id}-x`);
    const yInput = document.getElementById(`${point.id}-y`);
    const zInput = document.getElementById(`${point.id}-z`);
    const zInputContainer = document.getElementById(`${point.id}-zInput`);

    const xError = document.getElementById(`${point.id}-xError`);
    const yError = document.getElementById(`${point.id}-yError`);
    const zError = document.getElementById(`${point.id}-zError`);

    const x = xInput && xInput.value ? xInput.value : null; //brauche ich das? 
    const y = yInput && yInput.value ? yInput.value : null;
    const z = zInput && zInput.value ? zInput.value : null;


    //console.log("checking x:" + x);
    //console.log("checking y:" + y);
    //console.log("checking z:" + z);

    //console.log("checking maxcoordvalue:" + maxCoordinateValue);
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

function toggleCoordinateFields(point) {
    dimension = parseInt(document.getElementById("dimension").value);
    layout = document.getElementById("layout").value;
    const layoutContainer = document.getElementById("layoutContainer");
    const zInput = document.getElementById(`${point.id}-zInput`);
    const zLabel = document.getElementById(`${point.id}-zLabel`);
    const zError = document.getElementById(`${point.id}-zError`);
    console.log("layout:" + layout)

    if (dimension === 3) {
        zLabel.classList.remove('hidden');
        zInput.classList.remove('hidden');
        zError.classList.remove('hidden');
        layoutContainer.classList.remove("hidden");
    } else {
        zLabel.classList.add('hidden');
        zInput.classList.add('hidden');
        zError.classList.add('hidden');
        layoutContainer.classList.add("hidden"); 
        layout = 'xyz'; // bei auswahl der dimension 2, wird das layout "zurückgesetzt" auf xyz
    }

    // Reihenfolge der Eingabefelder (in Abhängigkeit vom Layout) aktualisieren 
    updateCoordinateInputOrder(layout, point);
}


function updateCoordinateInputOrder(layout, point) {
    const xLabel = document.querySelector(`label[for="${point.id}-x"]`);
    const yLabel = document.querySelector(`label[for="${point.id}-y"]`);
    const zLabel = document.querySelector(`label[for="${point.id}-z"]`);

    const xGroup = document.querySelector(`#${point.id}-x`).closest('.input-group');
    const yGroup = document.querySelector(`#${point.id}-y`).closest('.input-group');
    const zGroup = document.querySelector(`#${point.id}-zInput`);

    const calculateButton = document.getElementById(`${point.id}-calculateButton`);
    const coordinateInputs = document.getElementById(`${point.id}-coordinateInputs`);

    // Container leeren
    coordinateInputs.innerHTML = '';

    // Layout anpassen
    if (layout === 'xyz') {
        coordinateInputs.appendChild(xLabel);
        coordinateInputs.appendChild(xGroup);
        coordinateInputs.appendChild(yLabel);
        coordinateInputs.appendChild(yGroup);
        if (zLabel) coordinateInputs.appendChild(zLabel); // falls es visible/ nicht hidden ist (3d)
        if (zGroup) coordinateInputs.appendChild(zGroup); // falls es visible/ nicht hidden ist (3d)
        coordinateInputs.appendChild(calculateButton);
    } else if (layout === 'zyx') {
        coordinateInputs.appendChild(zLabel);
        coordinateInputs.appendChild(zGroup);
        coordinateInputs.appendChild(yLabel);
        coordinateInputs.appendChild(yGroup);
        coordinateInputs.appendChild(xLabel);
        coordinateInputs.appendChild(xGroup);
        coordinateInputs.appendChild(calculateButton);
    }
}

function handleSettingsChange() {
    // "settings" aus html holen
    bitLength = parseInt(document.getElementById("bitLength").value);
    dimension = parseInt(document.getElementById("dimension").value);
    layout = document.getElementById("layout").value;

    clearContainers();
    toggleCoordinateFields(pointA); 
    toggleCoordinateFields(pointB);
    displayMaxCoord();
    closeCode('a-forLoopCodeContainer', 'a-magicBitsHeader', 'a-show-code-btn', 'a-resultMagicBits'); // to-do: prüfen, ob offen 
    closeCode('a-magicBitsCodeContainer', 'a-forLoopHeader','a-show-code-btn2','a-resultForLoop');// to-do: prüfen, ob offen 
    closeCode('b-forLoopCodeContainer', 'b-magicBitsHeader', 'b-show-code-btn', 'b-resultMagicBits'); // to-do: prüfen, ob offen 
    closeCode('b-magicBitsCodeContainer', 'b-forLoopHeader','b-show-code-btn2','b-resultForLoop');// to-do: prüfen, ob offen 
}

function clearStencil(point) {
    document.getElementById(`stencilContainer-${point.id}`).classList.remove('expanded');

    const canvas = document.getElementById(`canvasStencil-${point.id}`);
    const resultDiv = document.getElementById(`stencilResult-${point.id}`);
    
    // Canvas leeren
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Inhalt des resultDiv leeren
    if (resultDiv) {
        resultDiv.innerHTML = '';
        resultDiv.style.removeProperty('height');
        resultDiv.style.resize = 'none';
    }
}

// -------------------------------------------------- Calculate Morton Code --------------------------------------------------------------

function calculateMortonCode(point) {
    // Ergebnisse zurücksetzen
    document.getElementById(`${point.id}-resultForLoop`).innerHTML = '';
    document.getElementById(`${point.id}-resultMagicBits`).innerHTML = '';

    // point container wieder klein und disable resize 
    const pointContainer = document.getElementById(`point-${point.id}`);
    pointContainer.style.removeProperty('height');
    pointContainer.style.resize = 'none';

    // stencil leeren
    clearStencil(point) 

    // addition und subtraktion ergebnisse und error leeren
    document.getElementById(`resultAddition`).innerHTML = '';
    document.getElementById(`resultSubtraction`).innerHTML = '';
    document.getElementById(`additionError`).innerHTML = '';
    document.getElementById(`subtractionError`).innerHTML = '';

    // Koordinaten überprüfen
    if (checkCoordinateLimits(point) == false) {
        console.log("No calculation for point", point.id);
        return;
    }

    // höhe und resizability für ergebnisse
    pointContainer.style.height = '500px';
    pointContainer.style.resize = 'vertical';

    // koordinaten values aus html holen
    const x = parseInt(document.getElementById(`${point.id}-x`).value);
    const y = parseInt(document.getElementById(`${point.id}-y`).value);
    const z = dimension === 3 ? (parseInt(document.getElementById(`${point.id}-z`).value)) : 0;
    //console.log("x: " + x+ " y: " +y+ " z: "+ z);

    // koordinaten in point objekte speichern
    point.x = x;
    point.y = y;
    point.z = dimension === 3 ? z : null; // Z nur speichern, wenn Dimension 3

    // Berechnungen durchführen
    const mortonCode = interleaveForLoop(point);
    displayMagicBits(point);

    // Morton-Codes speichern
    point.mortonCode = mortonCode;

    // stencil generieren
    generateStencil(`${point.id}`);
}

// ---------------------------------------------- Interleave mit For-Schleife ----------------------------------------------------------


function interleaveForLoop(point) {
    let mortonCode = BigInt(0);
    const bitsPerCoord = parseInt(bitLength / dimension); 
    const bitsMortonCode = bitsPerCoord * dimension;

    const resultContainer = document.getElementById(`${point.id}-resultForLoop`);

    // koordinaten in ein array
    let coords = [];
    if (dimension === 3) {
        coords = layout === "xyz" ? [point.x, point.y, point.z] : [point.z, point.y, point.x];
    } else {
        coords = [point.x, point.y];
    }

    // display coordinates in binary and colorized
    let binaryCoordinates = '';
    for (let i = 0; i < coords.length; i++) {
        const coord = coords[i];
        const colorClass = `color-${layout[i]}`; // Farben basierend auf Index
        const binaryString = `<span class="${colorClass}">${coord.toString(2).padStart(bitsPerCoord, '0')}</span>`;
        binaryCoordinates += `<div class="binary">${layout[i]} = ${binaryString} (decimal: ${coord})</div>`;
    }

    // display input coordinates
    const coordinates = document.createElement("div");
    coordinates.innerHTML = `${binaryCoordinates}<br>`;
    resultContainer.appendChild(coordinates);

    // funktion für Morton Code und Rechenschritte (binary und mit Nullen füllen)
    function formatBinary(value) {
        return value.toString(2).padStart(Number(bitsMortonCode), '0');
    }

    // Morton Code färben
    function colorizeBits(binaryStr) {
        let coloredStr = '';
        const length = binaryStr.length;

        // Schleife von rechts nach links durch die Bits
        for (let k = length - 1; k >= 0; k--) {
            const colorClass = `color-${layout[(length - 1 - k) % dimension]}`; // Farben basierend auf Index

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
            const colorClass = `color-${layout[j]}`; // Farben basierend auf Index

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

function displayMagicBits(point) {
    const resultContainer = document.getElementById(`${point.id}-resultMagicBits`);
    const maxBits = parseInt(bitLength / dimension);

    // koordinaten in ein array
    let coords = [];
    if (dimension === 3) {
        coords = layout === "xyz" ? [point.x, point.y, point.z] : [point.z, point.y, point.x];
    } else {
        coords = [point.x, point.y];
    }

    // Berechnung entsprechend Dimension
    console.log("dimension in displaymagicbits: " + dimension)
    console.log("dimension type " + typeof dimension)
    const { mortonCode, steps } = dimension === 2
        ? mortonEncodeMagicBits2D(coords[0], coords[1], bitLength)
        : mortonEncodeMagicBits3D(coords[0], coords[1], coords[2], bitLength);

    // display coordinates in binary and colorized
    let binaryCoordinates = '';
    for (let i = 0; i < coords.length; i++) {
        const coord = coords[i];
        const colorClass = `color-${layout[i]}`;
        const binaryString = `<span class="${colorClass}">${coord.toString(2).padStart(maxBits, '0')}</span>`;
        binaryCoordinates += `<div class="binary">${layout[i]} = ${binaryString} (decimal: ${coord})</div>`;
    }


    // Schritte formatieren und farbig kodieren
    let bitSteps = '';
    for (let i = 0; i < steps.length; i++) {
        const stepInfo = steps[i];
        const colorClass = `color-${layout[i]}`; // Farben basierend auf Index
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
        const colorClass = `color-${layout[reversedIndex % dimension]}`; // Farben basierend auf Index
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
    const resultContainer = document.getElementById(`resultAddition`);
    resultContainer.innerHTML = "";
    
    if (!checkMortonCodesExist('additionError')) {
        console.log("Morton code does not exist");
        return;
    }
    if (!checkCoordinatesForAddition()) {
        console.log("out of range");
        return;
    }

    // höhe und resizability für ergebnisse
    resultContainer.style.height = '300px';
    resultContainer.style.resize = 'vertical';

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

        steps += `<h4>Calculation Steps: </h4>`;
        steps += `<p>masks: </p>
        <div class="binary">X-mask: 0x${x2_mask.toString(16).toUpperCase()}<br>
        Y-mask: 0x${y2_mask.toString(16).toUpperCase()}</div><br>`;

        const x_sum = (pointA.mortonCode | y2_mask) + (pointB.mortonCode & x2_mask);
        steps += `<p>x-sum calculation:</p><div class="binary">(pointA | Y-mask) + (pointB & X-mask):<br><br>
        <span class="color-a">${pointA.mortonCode.toString(2).padStart(bitLength, '0')}</span> | ${y2_mask.toString(2).padStart(bitLength, '0')} + <span class="color-b">${pointB.mortonCode.toString(2).padStart(bitLength, '0')}</span> & ${x2_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${x_sum.toString(2).padStart(bitLength, '0')}</div><br>`;

        const y_sum = (pointA.mortonCode | x2_mask) + (pointB.mortonCode & y2_mask);
        steps += `<p>y-sum calculation: </p><div class="binary">(pointA | X-mask) + (pointB & Y-mask):<br><br>
        <span class="color-a">${pointA.mortonCode.toString(2).padStart(bitLength, '0')}</span> | ${x2_mask.toString(2).padStart(bitLength, '0')} + <span class="color-b">${pointB.mortonCode.toString(2).padStart(bitLength, '0')}</span> & ${y2_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${y_sum.toString(2).padStart(bitLength, '0')}</div><br>`;

        sum = (x_sum & x2_mask) | (y_sum & y2_mask);
        steps += `<p>final sum: </p><div class="binary">(X-sum & X-mask) | (Y-sum & Y-mask):<br><br>
        ${x_sum.toString(2).padStart(bitLength, '0')} & ${x2_mask.toString(2).padStart(bitLength, '0')} | ${y_sum.toString(2).padStart(bitLength, '0')} & ${y2_mask.toString(2).padStart(bitLength, '0')} <br><br>= <b>${sum.toString(2).padStart(bitLength, '0')}</b></div><br><br>`;

    } else if (dimension === 3) {
        // Generate masks for 3D
        const x3_mask = generateMask("100", bitLength);
        const y3_mask = generateMask("010", bitLength);
        const z3_mask = generateMask("001", bitLength);
        const xy3_mask = x3_mask | y3_mask;
        const xz3_mask = x3_mask | z3_mask;
        const yz3_mask = y3_mask | z3_mask;

        steps += `<h4>Calculation Steps: </h4>`;
        steps += `<p>masks: </p>
        <div class="binary">X-mask: 0x${x3_mask.toString(16).toUpperCase()}<br>
        Y-mask: 0x${y3_mask.toString(16).toUpperCase()}<br>
        Z-mask: 0x${z3_mask.toString(16).toUpperCase()}</div><br>`;

        const x_sum = (pointA.mortonCode | yz3_mask) + (pointB.mortonCode & x3_mask);
        steps += `<p>x-sum calculation:</p><div class="binary">(pointA | YZ-mask) + (pointB & X-mask):<br><br>
        <span class="color-a">${pointA.mortonCode.toString(2).padStart(bitLength, '0')}</span> | ${yz3_mask.toString(2).padStart(bitLength, '0')} + <span class="color-b">${pointB.mortonCode.toString(2).padStart(bitLength, '0')}</span> & ${x3_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${x_sum.toString(2).padStart(bitLength, '0')}</div><br>`;

        const y_sum = (pointA.mortonCode | xz3_mask) + (pointB.mortonCode & y3_mask);
        steps += `<p>y-sum calculation: </p><div class="binary">(pointA | XZ-mask) + (pointB & Y-mask):<br><br>
        <span class="color-a">${pointA.mortonCode.toString(2).padStart(bitLength, '0')}</span> | ${xz3_mask.toString(2).padStart(bitLength, '0')} + <span class="color-b">${pointB.mortonCode.toString(2).padStart(bitLength, '0')}</span> & ${y3_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${y_sum.toString(2).padStart(bitLength, '0')}</div><br>`;

        const z_sum = (pointA.mortonCode | xy3_mask) + (pointB.mortonCode & z3_mask);
        steps += `<p>z-sum calculation: </p><div class="binary">(pointA | XY-mask) + (pointB & Z-mask):<br><br>
        <span class="color-a">${pointA.mortonCode.toString(2).padStart(bitLength, '0')}</span> | ${xy3_mask.toString(2).padStart(bitLength, '0')} + <span class="color-b">${pointB.mortonCode.toString(2).padStart(bitLength, '0')}</span> & ${z3_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${z_sum.toString(2).padStart(bitLength, '0')}</div><br>`;

        sum = (x_sum & x3_mask) | (y_sum & y3_mask) | (z_sum & z3_mask);
        steps += `<p>final sum: </p><div class="binary">(X-sum & X-mask) | (Y-sum & Y-mask) | (Z-sum & Z-mask):<br><br>
        ${x_sum.toString(2).padStart(bitLength, '0')} & ${x3_mask.toString(2).padStart(bitLength, '0')} | ${y_sum.toString(2).padStart(bitLength, '0')} & ${y3_mask.toString(2).padStart(bitLength, '0')} | ${z_sum.toString(2).padStart(bitLength, '0')} & ${z3_mask.toString(2).padStart(bitLength, '0')} <br><br>= <b>${sum.toString(2).padStart(bitLength, '0')}</b></div><br><br>`;
    } else {
        resultContainer.innerHTML = "<p>Invalid dimension!</p>";
        return;
    }

    // Koordinaten und Morton-Codes der Punkte anzeigen
    resultContainer.innerHTML = `<p class="binary">point a = (${pointA.x}, ${pointA.y}${pointA.z !== null ? `, ${pointA.z}` : ''})<br><br> morton code: <span class="color-a">${pointA.mortonCode.toString(2).padStart(bitLength, '0')}</span> (decimal: ${pointA.mortonCode})<br><br><br>
                                point b = (${pointB.x}, ${pointB.y}${pointB.z !== null ? `, ${pointB.z}` : ''})<br><br> morton code: <span class="color-b">${pointB.mortonCode.toString(2).padStart(bitLength, '0')}</span> (decimal: ${pointB.mortonCode})<br><br><br>
                                result:<br><br>
                                a + b = (${pointA.x + pointB.x}, ${pointA.y + pointB.y}${pointA.z !== null ? `, ${pointA.z + pointB.z}` : ''})<br><br>
                                morton code: <b>${sum.toString(2).padStart(bitLength, '0')}</b> (decimal: ${sum})<br><br><br></div>`;

    // Ergebnisse und Schritte anzeigen
    resultContainer.innerHTML += steps;
}




function subtraction() {
    // Ergebnisse zurücksetzen
    const resultContainer = document.getElementById(`resultSubtraction`);
    resultContainer.innerHTML = "";

    if (!checkMortonCodesExist('subtractionError')) {
        console.log("Morton code does not exist");
        return;
    }

    if (checkCoordinatesForSubtraction() === false) {
        console.log("No subtraction!");
        return;
    }

    // höhe und resizability für ergebnisse
    resultContainer.style.height = '300px';
    resultContainer.style.resize = 'vertical';

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

        steps += `<h4>Calculation Steps: </h4>`;
        steps += `<p>masks: </p>
        <div class="binary">X-mask: 0x${x2_mask.toString(16).toUpperCase()}<br>
        Y-mask: 0x${y2_mask.toString(16).toUpperCase()}</div><br>`;

        const x_diff = (pointA.mortonCode & x2_mask) - (pointB.mortonCode & x2_mask);
        steps += `<p>X-diff calculation:</p><div class="binary">(pointA & X-mask) - (pointB & X-mask):<br><br>
        <span class="color-a">${pointA.mortonCode.toString(2).padStart(bitLength, '0')}</span> & ${x2_mask.toString(2).padStart(bitLength, '0')} - <span class="color-b">${pointB.mortonCode.toString(2).padStart(bitLength, '0')}</span> & ${x2_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${x_diff.toString(2).padStart(bitLength, '0')}</div><br>`;

        const y_diff = (pointA.mortonCode & y2_mask) - (pointB.mortonCode & y2_mask);
        steps += `<p>Y-diff calculation:</p><div class="binary">(pointA & Y-mask) - (pointB & Y-mask):<br><br>
        <span class="color-a">${pointA.mortonCode.toString(2).padStart(bitLength, '0')}</span> & ${y2_mask.toString(2).padStart(bitLength, '0')} - <span class="color-b">${pointB.mortonCode.toString(2).padStart(bitLength, '0')}</span> & ${y2_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${y_diff.toString(2).padStart(bitLength, '0')}</div><br>`;

        diff = (x_diff & x2_mask) | (y_diff & y2_mask);
        steps += `<p>final diff:</p><div class="binary">(X-diff & X-mask) | (Y-diff & Y-mask):<br><br>
        ${x_diff.toString(2).padStart(bitLength, '0')} & ${x2_mask.toString(2).padStart(bitLength, '0')} | ${y_diff.toString(2).padStart(bitLength, '0')} & ${y2_mask.toString(2).padStart(bitLength, '0')} <br><br>= <b>${diff.toString(2).padStart(bitLength, '0')}</b></div><br><br>`;

    } else if (dimension === 3) {
        // Generate masks for 3D
        const x3_mask = generateMask("100", bitLength);
        const y3_mask = generateMask("010", bitLength);
        const z3_mask = generateMask("001", bitLength);

        steps += `<h4>Calculation Steps: </h4>`;
        steps += `<p>masks: </p>
        <div class="binary">X-mask: 0x${x3_mask.toString(16).toUpperCase()}<br>
        Y-mask: 0x${y3_mask.toString(16).toUpperCase()}<br>
        Z-mask: 0x${z3_mask.toString(16).toUpperCase()}</div><br>`;

        const x_diff = (pointA.mortonCode & x3_mask) - (pointB.mortonCode & x3_mask);
        steps += `<p>X-diff calculation:</p><div class="binary">(pointA & X-mask) - (pointB & X-mask):<br><br>
        <span class="color-a">${pointA.mortonCode.toString(2).padStart(bitLength, '0')}</span> & ${x3_mask.toString(2).padStart(bitLength, '0')} - <span class="color-b">${pointB.mortonCode.toString(2).padStart(bitLength, '0')}</span> & ${x3_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${x_diff.toString(2).padStart(bitLength, '0')}</div><br>`;

        const y_diff = (pointA.mortonCode & y3_mask) - (pointB.mortonCode & y3_mask);
        steps += `<p>Y-diff calculation:</p><div class="binary">(pointA & Y-mask) - (pointB & Y-mask):<br><br>
        <span class="color-a">${pointA.mortonCode.toString(2).padStart(bitLength, '0')}</span> & ${y3_mask.toString(2).padStart(bitLength, '0')} - <span class="color-b">${pointB.mortonCode.toString(2).padStart(bitLength, '0')}</span> & ${y3_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${y_diff.toString(2).padStart(bitLength, '0')}</div><br>`;

        const z_diff = (pointA.mortonCode & z3_mask) - (pointB.mortonCode & z3_mask);
        steps += `<p>Z-diff calculation:</p><div class="binary">(pointA & Z-mask) - (pointB & Z-mask):<br><br>
        <span class="color-a">${pointA.mortonCode.toString(2).padStart(bitLength, '0')}</span> & ${z3_mask.toString(2).padStart(bitLength, '0')} - <span class="color-b">${pointB.mortonCode.toString(2).padStart(bitLength, '0')}</span> & ${z3_mask.toString(2).padStart(bitLength, '0')} <br><br>= ${z_diff.toString(2).padStart(bitLength, '0')}</div><br>`;

        diff = (x_diff & x3_mask) | (y_diff & y3_mask) | (z_diff & z3_mask);
        steps += `<p>final diff:</p><div class="binary">(X-diff & X-mask) | (Y-diff & Y-mask) | (Z-diff & Z-mask):<br><br>
        ${x_diff.toString(2).padStart(bitLength, '0')} & ${x3_mask.toString(2).padStart(bitLength, '0')} | ${y_diff.toString(2).padStart(bitLength, '0')} & ${y3_mask.toString(2).padStart(bitLength, '0')} | ${z_diff.toString(2).padStart(bitLength, '0')} & ${z3_mask.toString(2).padStart(bitLength, '0')} <br><br>= <b>${diff.toString(2).padStart(bitLength, '0')}</b></div><br><br>`;
    }

    // Koordinaten und Morton-Codes der Punkte anzeigen
    resultContainer.innerHTML = `<p class="binary">point a = (${pointA.x}, ${pointA.y}${pointA.z !== null ? `, ${pointA.z}` : ''})<br><br> morton code: <span class="color-a">${pointA.mortonCode.toString(2).padStart(bitLength, '0')}</span> (decimal: ${pointA.mortonCode})<br><br><br>
    point b = (${pointB.x}, ${pointB.y}${pointB.z !== null ? `, ${pointB.z}` : ''})<br><br> morton code: <span class="color-b">${pointB.mortonCode.toString(2).padStart(bitLength, '0')}</span> (decimal: ${pointB.mortonCode})<br><br><br>
    result:<br><br>
    a - b = (${pointA.x - pointB.x}, ${pointA.y - pointB.y}${pointA.z !== null ? `, ${pointA.z - pointB.z}` : ''})<br><br>
    morton code: <b>${diff.toString(2).padStart(bitLength, '0')}</b> (decimal: ${diff})<br><br><br></div>`;

    // Ergebnisse und Schritte anzeigen
    resultContainer.innerHTML += steps;
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
    document.getElementById(`stencilContainer-${pointId}`).classList.remove("hidden");
    document.getElementById(`stencilContainer-${pointId}`).classList.add('expanded');
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
    canvas.width = 700;  // Ändert die interne Breite 
    canvas.height = 550;

    canvas.style.width = '350px';  // darstellungsgröße
    canvas.style.height = '275px'; 

    ctx.scale(2, 2); // skaliert das bild (für höhere auflösung)

    // achsen-layout zeigen
    const img = new Image();
    img.src = "assets/xy.svg";
    img.onload = function () {
        ctx.drawImage(img, 10, 10, 40, 40);
    };

    const centerX = 180;
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
    const hiddenColor = '#ccc' // for coordinates that are out of bounds 
    const circleColor = '#303030'; 
    const centerColor = '#0C9329'; // grün
    const textColor = '#000'

    function isOutOfBounds(point) {
        return point.x < 0 || point.y < 0 ||
               point.x > maxCoordinateValue || point.y > maxCoordinateValue;
    }

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
            if (isOutOfBounds(point) || isOutOfBounds(rightPoint)){
                ctx.strokeStyle = hiddenColor;
            } else {
                ctx.strokeStyle = lineColor;
            }
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
            if (isOutOfBounds(point) ||isOutOfBounds(bottomPoint)){
                ctx.strokeStyle = hiddenColor;
            } else {
                ctx.strokeStyle = lineColor;
            }
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
        // "hide" values that are out of bounds
        if (isOutOfBounds(point)){
            ctx.fillStyle = hiddenColor;
        } else {
            ctx.fillStyle = (index === 4) ? centerColor : circleColor; // Mittelpunkt grün füllen
        }
        ctx.fill();

        // Koordinaten zeichnen
        ctx.fillStyle = textColor;
        const adjustedPy = [1, 4, 7].includes(index) ? py - 10 : py; // 10 Pixel nach unten für Index 1, 4, 7
        if (!isOutOfBounds(point)){
            ctx.fillText(`(${point.x}, ${point.y})`, px, adjustedPy + 25); 
        }
    });


    // Morton-Codes für 2D-Stencil ausgeben
    outputMortonCodes(points, pointId);
}



function generateStencil3D(canvas, ctx, pointId) {
    outputMortonCodes3D(pointId);
    canvas.width = 1700;  // Ändert die interne Breite 
    canvas.height = 700;

    canvas.style.width = '850px';  // darstellungsgröße
    canvas.style.height = '350px'; 

    ctx.scale(2, 2); // skaliert das bild (für höhere auflösung)

    // achsen-layout zeigen
    const img = new Image();
    img.src = "assets/xyz.svg";
    img.onload = function () {
        ctx.drawImage(img, 10, 10, 40, 40);
    };

    const centerX = 170;
    const centerY = 210;
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
    const hiddenColor = '#ccc' // for coordinates that are out of bounds 
    const circleColor = '#303030'; 
    const centerColor = '#0C9329'; // grün
    const textColor = '#000'

    function isOutOfBounds(point, z) {
        return point.x < 0 || point.y < 0 || z < 0 ||
               point.x > maxCoordinateValue || point.y > maxCoordinateValue || z > maxCoordinateValue;
    } 
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
        points.forEach((point, i) => {
            const px = layerCenterX + (point.x - pointId.x) * offset;
            const py = layerCenterY - (point.y - pointId.y) * offset;

            // Horizontale Verbindungen
            if (i % 3 !== 2) { // 0,1,3,4,6,7 (alle außer die drei rechten)
                const rightPoint = points[i + 1];
                if (isOutOfBounds(point, z) || isOutOfBounds(rightPoint, z)){
                    ctx.strokeStyle = hiddenColor;
                } else {
                    ctx.strokeStyle = lineColor;
                }
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
                if (isOutOfBounds(point, z) ||isOutOfBounds(bottomPoint, z)){
                    ctx.strokeStyle = hiddenColor;
                } else {
                    ctx.strokeStyle = lineColor;
                }
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
            // "hide" values that are out of bounds
            if (isOutOfBounds(point, z)){
                ctx.fillStyle = hiddenColor;
            } else {
                ctx.fillStyle = (index === 4 && layerIndex === 1) ? centerColor : circleColor; // Mittelpunkt grün füllen
            }
            ctx.fill(); 

            // Koordinaten zeichnen
            ctx.fillStyle = textColor;
            const adjustedPy = [1, 4, 7].includes(index) ? py - 10 : py; // 10 Pixel nach oben für Index 1, 4, 7
            if (!isOutOfBounds(point, z)){
                if (layout == 'xyz'){
                    ctx.fillText(`(${point.x}, ${point.y}, ${z})`, px + 2, adjustedPy + 25); 
                } else if (layout == 'zyx') {
                    ctx.fillText(`(${z}, ${point.y}, ${point.x})`, px + 2, adjustedPy + 25); 
                }
            }
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
    document.getElementById(`stencilResult-${pointId.id}`).innerHTML += `<h4>Morton Codes:</h4>`;

    // Mittelpunkt-Morton-Code
    const centerMorton = BigInt(pointId.mortonCode);

    if (bitLength == 16){
        x_mask = BigInt(0x5555); // x (0101010101010101)
        y_mask = BigInt(0xAAAA); // y (1010101010101010)
    } else if (bitLength == 32) {
        x_mask = BigInt(0x55555555); 
        y_mask = BigInt(0xAAAAAAAA); 
    } else if (bitLength == 64) {
        x_mask = BigInt(0x5555555555555555n); 
        y_mask = BigInt(0xAAAAAAAAAAAAAAAAn); 
    }

    function isOutOfBounds(point) {
        return point.x < 0 || point.y < 0 ||
               point.x > maxCoordinateValue || point.y > maxCoordinateValue;
    }

    console.log("x_mask (x): "+x_mask.toString(2) )
    console.log("y_mask (y): "+y_mask.toString(2) )

    points.forEach((point, index) => {
        let mortonCode;

        if (index === 4) { // Mittelpunkt
            mortonCode = centerMorton;

            const colorStyle = 'style="color: #0C9329;"'
            document.getElementById(`stencilResult-${pointId.id}`).innerHTML += 
            `<p ${colorStyle}> point (${point.x}, ${point.y}): Morton Code = ${mortonCode.toString(2).padStart(bitLength, '0')} (decimal: ${mortonCode})</p>`;

        } else if (!isOutOfBounds(point)){
            // Morton-Code für direkte Nachbarpunkte berechnen
            if (index === 1) { // Oben
                mortonCode = (((centerMorton | x_mask) + 1n) & y_mask) | (centerMorton & x_mask);
            } else if (index === 7) { // Unten
                mortonCode = (((centerMorton & y_mask) - 1n) & y_mask) | (centerMorton & x_mask);
            } else if (index === 3) { // Links
                mortonCode = (((centerMorton & x_mask) - 1n) & x_mask) | (centerMorton & y_mask);
            } else if (index === 5) { // Rechts
                mortonCode = (((centerMorton | y_mask) + 1n) & x_mask) | (centerMorton & y_mask);
            } else if (index === 0) { // Oben links
                let temp = (((centerMorton | x_mask) + 1n) & y_mask) | (centerMorton & x_mask);
                mortonCode = (((temp & x_mask) - 1n) & x_mask) | (temp & y_mask);
            } else if (index === 2) { // Oben rechts
                let temp = (((centerMorton | x_mask) + 1n) & y_mask) | (centerMorton & x_mask);
                mortonCode = (((temp | y_mask) + 1n) & x_mask) | (temp & y_mask);
            } else if (index === 6) { // Unten links
                let temp = (((centerMorton & y_mask) - 1n) & y_mask) | (centerMorton & x_mask);
                mortonCode = (((temp & x_mask) - 1n) & x_mask) | (temp & y_mask);
            } else if (index === 8) { // Unten rechts
                let temp = (((centerMorton & y_mask) - 1n) & y_mask) | (centerMorton & x_mask);
                mortonCode = (((temp | y_mask) + 1n) & x_mask) | (temp & y_mask);
            }

            document.getElementById(`stencilResult-${pointId.id}`).innerHTML += 
            `<p> point (${point.x}, ${point.y}): Morton Code = ${mortonCode.toString(2).padStart(bitLength, '0')} (decimal: ${mortonCode})</p>`;
        }
    });
}

function outputMortonCodes3D(pointId) {
    const resultContainer = document.getElementById(`stencilResult-${pointId.id}`)
    
    resultContainer.innerHTML = '';
    // höhe und resizability für ergebnisse
    resultContainer.style.height = '250px';
    resultContainer.style.resize = 'vertical';

    resultContainer.innerHTML += `<h4>Morton Codes:</h4>`;

    function isOutOfBounds(x, y, z) {
        return x < 0 || y < 0 || z < 0 ||
               x > maxCoordinateValue || y > maxCoordinateValue || z > maxCoordinateValue;
    } 

    for (let i = -1; i < 2; i++){
        for (let j = -1; j < 2; j++){
            for (let k = -1; k < 2; k++){
                const colorStyle = i === 0 && j === 0 && k === 0 ? 'style="color: #0C9329;"' : '';
                if(!isOutOfBounds(pointId.x + i, pointId.y + j, pointId.z + k)) {
                    if (layout == 'xyz'){
                        result = mortonEncodeMagicBits3D(pointId.x + i, pointId.y + j, pointId.z + k, bitLength);
                        resultContainer.innerHTML += 
                        `<p ${colorStyle}> point (${pointId.x + i}, ${pointId.y + j}, ${pointId.z + k}): Morton Code: ${result.mortonCode.toString(2).padStart(bitLength, '0')} (decimal: ${result.mortonCode})</p>`;
                    } else if (layout == 'zyx'){
                        result = mortonEncodeMagicBits3D(pointId.z + i, pointId.y + j, pointId.x + k, bitLength);
                        resultContainer.innerHTML += 
                        `<p ${colorStyle}> point (${pointId.z + i}, ${pointId.y + j}, ${pointId.x + k}): Morton Code: ${result.mortonCode.toString(2).padStart(bitLength, '0')} (decimal: ${result.mortonCode})</p>`;
                    }
                }
            }
        }
    }
}


   
