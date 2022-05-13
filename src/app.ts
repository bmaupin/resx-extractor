import fileType from 'file-type';
import { createReadStream } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import sax from 'sax';

type ResxData = {
  name: string;
  mimetype?: string;
  type?: string;
  values: string[];
};

let destinationPath = '';

const main = async () => {
  if (process.argv.length !== 4) {
    console.log(
      'Error: Please provide the resx file path and the destination path'
    );
    process.exit(1);
  }

  const resxFilePath = process.argv[2];
  destinationPath = process.argv[3];

  await createDestinationPath(destinationPath);
  extractResxFile(resxFilePath);
};

const createDestinationPath = async (destinationPath: string) => {
  mkdir(destinationPath);
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
  console.log(`Processing ${resxData.name}`);

  // These will be in .resx files generated from ILSpy (see README.md)
  // This is mostly deprecated by ResourceExtractorDotNet, but no harm in leaving it here
  // for historical purposes
  if (
    resxData.mimetype === 'application/x-microsoft.net.object.binary.base64'
  ) {
    const buffer = Buffer.from(resxData.values.join(''), 'base64');

    const classNameLength = buffer.readUInt8(0x6d);
    const className = buffer.subarray(0x6e, 0x6e + classNameLength).toString();

    if (className === 'System.Drawing.Bitmap') {
      // This is a naïve hack to extract System.Drawing.Bitmap content 🤷‍♂️
      const dataString = buffer.subarray(0x88, 0x8c).toString();
      if (dataString !== 'Data') {
        console.warn(
          `Warning: string from 0x88 to 0x8c in ${resxData.name} value does not equal 'Data'`
        );
      }

      // The data ends with an extra byte containting `0x0b`
      const data = buffer.subarray(0xa1, buffer.length - 1);

      // Try to determine the filetype, to use as the extension
      const type = await fileType.fromBuffer(data);
      const filename = `${resxData.name}.${type?.ext || 'bin'}`;

      await writeFile(path.join(destinationPath, filename), data);
    }
  } else if (
    // These will be in .resx files generated from ResourceExtractorDotNet
    resxData.mimetype ===
      'application/x-microsoft.net.object.bytearray.base64' ||
    // These could be in .resx files from IlSpy or ResourceExtractorDotNet
    resxData.type?.startsWith('System.Byte[]')
  ) {
    const buffer = Buffer.from(resxData.values.join(''), 'base64');

    const type = await fileType.fromBuffer(buffer);
    const filename = `${resxData.name}.${type?.ext || 'bin'}`;

    await writeFile(path.join(destinationPath, filename), buffer);
  }
};

main();
