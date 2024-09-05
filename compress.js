"use strict"

const fs = require('fs').promises

const rleCompress = (text) => {
  return text.split('')
    .reduce((acc, curr) => {
      const [lastChar, count] = acc.length ? acc[acc.length - 1] : ['', 0]
      if (curr === lastChar) {
        acc[acc.length - 1] = [lastChar, count + 1]
      } else {
        acc.push([curr, 1])
      }
      return acc
    }, [])
    .map(([char, count]) => `${count}${char}`)
    .join('')
}

const lz77Compress = (text) => {
  const windowSize = 100; // Tamaño de la ventana de búsqueda
  const lookAheadBufferSize = 20; // Tamaño del búfer de exploración

  let i = 0;
  let result = [];

  while (i < text.length) {
    let matchLength = 0;
    let matchDistance = 0;

    // Ventana de búsqueda (parte del texto que ya se procesó)
    let windowStart = Math.max(0, i - windowSize);
    let searchWindow = text.slice(windowStart, i);

    // Búfer de exploración (parte del texto que estamos buscando en la ventana)
    let lookAheadBuffer = text.slice(i, i + lookAheadBufferSize);

    // Buscar la secuencia más larga que coincida
    for (let j = 0; j < searchWindow.length; j++) {
      let length = 0;
      while (
        length < lookAheadBuffer.length &&
        searchWindow[j + length] === lookAheadBuffer[length]
      ) {
        length++;
      }

      // Si encontramos una coincidencia más larga, actualizamos
      if (length > matchLength) {
        matchLength = length;
        matchDistance = searchWindow.length - j;
      }
    }

    // Si no hay coincidencia, simplemente copiamos el carácter
    if (matchLength === 0) {
      result.push([0, 0, text[i]]);
      i++;
    } else {
      result.push([matchDistance, matchLength, text[i + matchLength]]);
      i += matchLength + 1;
    }
  }

  return result;
}

const losslessCompress = (text) => {
  const wordMap = {}
  const words = text.split(/\s+/)
  const response = words
    .reduce((acc, curr, idx) => {
      const pointer = wordMap[curr] !== undefined ? wordMap[curr] : null
      if (pointer && curr.length > `${pointer}`.length + 2) {
        acc.push(`#${pointer}`)
      } else {
        if (curr.length > 2) {
          wordMap[curr] = idx
        }
        acc.push(curr)
      }
      return acc
    }, []).join(' ').trim()
  return response
}

const algorithms = {
  rle: rleCompress,
  lz77: lz77Compress,
  ll: losslessCompress,
}

const byteSize = (text) => {
  let _text = typeof text === 'string' ? text : JSON.stringify(text)
  return Buffer.byteLength(_text, 'utf8')
}

async function main() {

  const algorithm = process.argv[2]
  const filePath = process.argv[3]

  if (!filePath) {
    console.error('Por favor proporciona una ruta al archivo a comprimir!')
    process.exit(1)
  }

  try {
    const text = await fs.readFile(filePath, 'utf-8')
    const compressedText = algorithms[algorithm](text)
    const textSize = byteSize(text)
    const compressedTextSize = byteSize(compressedText)

    console.log('Compresión terminada!')
    console.log(`Ratio de compresión: ${Math.ceil(compressedTextSize * 100 / textSize)}%`)
    console.log(`Original: ${textSize} bytes`)
    console.log(`Comprimido: ${compressedTextSize} bytes`)

    try {
      const compressedFileName = `${filePath.split('.')[0]}.${algorithm}.txt`
      await fs.writeFile(compressedFileName, JSON.stringify(compressedText), 'utf8')
      console.log('Archivo creado -->', compressedFileName)
    } catch (error) {
      console.error('Error creando el archivo: ', error)
    }

    return compressedText
  } catch (error) {
    console.error('Error al leer el archivo', error)
  }
}

main()