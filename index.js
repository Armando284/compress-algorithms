"use strict"

const fs = require('fs').promises

const rleCompress = (text) => {
	return text.split('')
		.reduce((acc, curr) => {
			const [lastChar, count] = acc.length ? acc[acc.length - 1] : ['', 0]
			if(curr === lastChar){
				acc[acc.length - 1] = [lastChar, count + 1]
			} else {
				acc.push([curr, 1])
			}
			return acc
		}, [])
		.map(([char, count]) => `${count}${char}`)
		.join('')
}

const compressFile = async (filePath) => {
	try {
		const text = await fs.readFile(filePath, 'utf-8')
		const compressedText = algorithms[algorithm](text)
	
		console.log('Compresión terminada!')
		console.log(`Ratio de compresión: ${ Math.ceil(compressedText.length * 100 / text.length) }%`)
		console.log(`Caracteres en texto original: ${ text.length }`)
		console.log(`Caracteres en texto comprimido: ${ compressedText.length }`)
		console.log('Texto comprimido: ', compressedText)

		return compressedText
	} catch (error) {
		console.error('Error al leer el archivo', error)
	}
}

const lz77Compress = (text) => {
  const windowSize = 10; // Tamaño de la ventana de búsqueda
  const lookAheadBufferSize = 4; // Tamaño del búfer de exploración

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

const algorithm = process.argv[2]
const filePath = process.argv[3]

const algorithms = {
	rle: rleCompress,
	lz77: lz77Compress,
}

if(!filePath){
	console.error('Por favor proporciona una ruta al archivo a comprimir!')
	process.exit(1)
}

compressFile(filePath)
