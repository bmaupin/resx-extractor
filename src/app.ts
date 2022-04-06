import fs from 'fs';
import sax from 'sax';

const main = () => {
  if (process.argv.length !== 3) {
    console.log('Error: Please provide the path of the resx file to extract');
    process.exit(1);
  }

  const resxFilePath = process.argv[2];

  extractResxFile(resxFilePath);
};

const extractResxFile = (resxFilePath: string) => {
  const strict = true;
  const saxStream = sax.createStream(strict);

  let name = '' as string;
  let mimetype = '' as string;

  saxStream.on('opentag', function (xmlNode: sax.Tag | sax.QualifiedTag) {
    if (xmlNode.name === 'data') {
      mimetype = xmlNode.attributes?.mimetype as string;
      name = xmlNode.attributes?.name as string;
    }
  });

  saxStream.on('text', function (text: string) {
    console.log('name=', name);
    console.log('mimetype=', mimetype);
    console.log('text=', text);

    processResource(name, mimetype, text);
  });

  fs.createReadStream(resxFilePath).pipe(saxStream);
};

const processResource = async (
  name: string,
  mimetype: string,
  value: string
) => {
  if (mimetype === 'application/x-microsoft.net.object.binary.base64') {
    const buffer = Buffer.from(value, 'base64');

    // See here for an explanation of this monster: https://github.com/sindresorhus/file-type/issues/525
    (async () => {
      const { fileTypeFromBuffer } = await import('file-type');

      const type = await fileTypeFromBuffer(buffer);
      console.log(type);
    })();
  }
};

main();
