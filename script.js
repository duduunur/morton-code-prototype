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
        //mortonCode = interleaveBits(coords, bitLength);
        mortonCode = mortonEncodeMagicBits(x,y,z);
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


function splitBy3(a) {
    let x = BigInt(a) & 0x1fffffn; // Nur die ersten 21 Bits verwenden und als BigInt speichern
    x = (x | (x << 32n)) & 0x1f00000000ffffn;
    x = (x | (x << 16n)) & 0x1f0000ff0000ffn;
    x = (x | (x << 8n)) & 0x100f00f00f00f00fn;
    x = (x | (x << 4n)) & 0x10c30c30c30c30c3n;
    x = (x | (x << 2n)) & 0x1249249249249249n;
    return x;
  }
  
  function mortonEncodeMagicBits(x, y, z) {
    // Umwandlung in BigInt und Zerstreuung der Bits für x, y und z
    const result = splitBy3(x) | (splitBy3(y) << 1n) | (splitBy3(z) << 2n);
    return result;
  }
  
  /*
  // Beispiel: Testen der Funktion
  const x = 3; // Beispielwerte für x, y und z
  const y = 5;
  const z = 7;
  console.log(mortonEncodeMagicBits(x, y, z).toString(2).padStart(64, "0")); // Ausgabe als 64-Bit-Binärzahl
*/