"use strict"

const fs = require('fs').promises

const losslessCompress = (text) => {
  const words = text.split(/\s+/)
  const response = words
    .reduce((acc, curr) => {
      if (/^#/.test(curr)) {
        const pointer = parseInt(curr.slice(1))
        acc.push(words[pointer])
      } else {
        acc.push(curr)
      }
      return acc
    }, []).join(' ').trim()
  return response
}

const algorithms = {
  // rle: rleCompress,
  // lz77: lz77Compress,
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
    const compressedText = await fs.readFile(filePath, 'utf-8')
    const decompressedText = algorithms[algorithm](compressedText.slice(1, -1))
    const textSize = byteSize(compressedText)
    const compressedTextSize = byteSize(decompressedText)

    console.log('Decompresión terminada!')
    console.log(`Comprimido: ${textSize} bytes`)
    console.log(`Decomprimido: ${compressedTextSize} bytes`)

    try {
      const decompressedFileName = `${filePath.split('.')[0].split('-')[0]}.dc.${algorithm}.txt`
      await fs.writeFile(decompressedFileName, JSON.stringify(decompressedText), 'utf8')
      console.log('Archivo creado -->', decompressedFileName)
    } catch (error) {
      console.error('Error creando el archivo: ', error)
    }

    return decompressedText
  } catch (error) {
    console.error('Error al leer el archivo', error)
  }
}

main()