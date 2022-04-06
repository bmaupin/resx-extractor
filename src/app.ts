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

const processResource = (name: string, mimetype: string, value: string) => {
  // TODO
};

main();
