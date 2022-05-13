Simple utility to extract binaries from .NET Resource (`.resx`) files

#### Features

- Uses a streaming XML parser, so will extract and write the output files as it parses the `.resx` file
- Can handle `System.Byte[]` data as well as a naïve attempt at extracting `System.Drawing.Bitmap`
- Uses [sindresorhus/file-type](https://github.com/sindresorhus/file-type) to try to determine the filetype and set and appropriate extension

#### Usage

1. (Optional) If you don't have the source, extract the `.resx` files from a .NET binary

   - (Recommended) Use [ResourceExtractorDotNet](https://github.com/leonidessaguisagjr/ResourceExtractorDotNet), (the binary can be downloaded from [https://github.com/leonidessaguisagjr/ResourceExtractorDotNet/issues/1](https://github.com/leonidessaguisagjr/ResourceExtractorDotNet/issues/1)) e.g.

     ```
     wine ResourceExtractorDotNet /path/to/FILE.exe resources/
     ```

     (Replace `/path/to/FILE.exe` with the path of the exe to extract resources from)

     ⓘ ResourceExtractorDotNet is recommended because the `.resx` files it generates contain `application/x-microsoft.net.object.bytearray.base64` entries which just have the raw base64-encoded data. ILSpy instead generates `application/x-microsoft.net.object.binary.base64` entries, which are encoded .NET objects, which can't be directly converted to binary files and instead the raw data must be extracted from them. ILSpy is also much slower.

   - Alternatively, use [ILSpy](https://github.com/icsharpcode/ILSpy)
     - A Docker image is available here: [https://github.com/bmaupin/ilspy-docker](https://github.com/bmaupin/ilspy-docker)

1. Run this tool to extract the binaries from a `.resx` file

   ```
   npm install
   npm start /path/to/file.resx /path/to/output/
   ```

#### Alternatives

- [soyersoyer/resx2files](https://github.com/soyersoyer/resx2files)
  - Written in Python
  - Only handles `System.Byte[]` and not `application/x-microsoft.net.object.bytearray.base64` or `application/x-microsoft.net.object.binary.base64` entries
  - Doesn't set file extensions
- An alternative solution could probably be written in .NET using [`ResXResourceReader`](https://docs.microsoft.com/dotnet/api/system.resources.resxresourcereader)
