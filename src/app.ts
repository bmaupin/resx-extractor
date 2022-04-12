import fileType from 'file-type';
import { createReadStream } from 'fs';
import { appendFile, unlink } from 'fs/promises';
import path from 'path';
import sax from 'sax';

let currentFilename = '';
let destinationPath = '';

const main = () => {
  if (process.argv.length !== 4) {
    console.log(
      'Error: Please provide the resx file path and the destination path'
    );
    process.exit(1);
  }

  const resxFilePath = process.argv[2];
  destinationPath = process.argv[3];

  extractResxFile(resxFilePath);
};

const extractResxFile = (resxFilePath: string) => {
  const strict = true;
  const saxStream = sax.createStream(strict);

  let name = '' as string;
  let mimetype = '' as string;
  let type = '' as string;

  saxStream.on('opentag', function (xmlNode: sax.Tag | sax.QualifiedTag) {
    if (xmlNode.name === 'data') {
      mimetype = xmlNode.attributes?.mimetype as string;
      name = xmlNode.attributes?.name as string;
      type = xmlNode.attributes?.type as string;
    }
  });

  // TODO: remove async/await and see
  saxStream.on('text', async function (text: string) {
    await processResource(name, text, mimetype, type);
  });

  createReadStream(resxFilePath).pipe(saxStream);
};

const processResource = async (
  name: string,
  value: string,
  mimetype?: string,
  type?: string
) => {
  if (mimetype === 'application/x-microsoft.net.object.binary.base64') {
    const buffer = Buffer.from(value, 'base64');

    // console.log('buffer=', String(buffer));

    // TODO: determine extension from file type
    const extension = 'bin';
    const filename = `${name}.${extension}`;

    await writeResourceFile(filename, buffer);
    // TODO
    // process.exit();

    // const type = await fileType.fromBuffer(buffer);
    // console.log('name=', name);
    // console.log('mimetype=', mimetype);
    // console.log(type?.ext);

    // TODO: file type recognition isn't working...
    // either file-type doesn't have the correct file types or we're not properly decoding the binary data

    // TODO: save the file
    // filename: name + type.ext
    // contents: buffer
  } else if (type?.startsWith('System.Byte[]')) {
    // const buffer = Buffer.from(value, 'base64');

    const buffer = Buffer.from(String(Buffer.from(value, 'ascii')), 'base64');

    // console.log('buffer=', String(buffer));

    // TODO: determine extension from file type
    const extension = 'byte';
    const filename = `${name}.${extension}`;

    // await writeFile(path.join(destinationPath, filename), buffer);

    // console.log('name=', name);
    // console.log('\t', buffer.length);

    await writeResourceFile(filename, buffer);
  }
};

const writeResourceFile = async (filename: string, buffer: Buffer) => {
  if (currentFilename !== filename) {
    try {
      await unlink(path.join(destinationPath, filename));
    } catch (error: any) {
      // Ignore errors if file doesn't exist
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    currentFilename = filename;
  }

  await appendFile(path.join(destinationPath, filename), buffer);
};

main();
