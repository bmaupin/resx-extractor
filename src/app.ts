import fileType from 'file-type';
import { createReadStream } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import sax from 'sax';

type ResxData = {
  name: string;
  mimetype?: string;
  type?: string;
  values: string[];
};

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

  let resxData = {} as ResxData;

  saxStream.on('opentag', function (xmlNode: sax.Tag | sax.QualifiedTag) {
    if (xmlNode.name === 'data') {
      resxData = {
        name: xmlNode.attributes?.name as string,
        mimetype: xmlNode.attributes?.mimetype as string,
        type: xmlNode.attributes?.type as string,
        values: [],
      };
    }
  });

  saxStream.on('text', function (text: string) {
    if (resxData.values) {
      resxData.values.push(text);
    }
  });

  saxStream.on('closetag', function (tag: string) {
    if (tag === 'value') {
      processResource(resxData);
    }
  });

  createReadStream(resxFilePath).pipe(saxStream);
};

const processResource = async (resxData: ResxData) => {
  if (
    resxData.mimetype === 'application/x-microsoft.net.object.binary.base64'
  ) {
    // TODO: figure out how to handle this
    return;

    const buffer = Buffer.from(resxData.values.join(''), 'base64');

    // console.log('buffer=', String(buffer));

    // TODO: determine extension from file type
    const extension = 'bin';
    const filename = `${name}.${extension}`;

    // await writeResourceFile(filename, buffer);
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
  } else if (resxData.type?.startsWith('System.Byte[]')) {
    const buffer = Buffer.from(resxData.values.join(''), 'base64');

    // TODO: reuse this code in the previous section
    // Try to determine the filetype, to use as the extension
    const type = await fileType.fromBuffer(buffer);
    // TODO: 'byte'-> 'bin' (using 'byte' temporarily to distinguish from previous section)
    const filename = `${resxData.name}.${type?.ext || 'byte'}`;

    await writeFile(path.join(destinationPath, filename), buffer);
  }
};

main();
