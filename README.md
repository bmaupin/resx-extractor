Simple utility to extract binaries from .NET Resource (`.resx`) files

#### Features

- Uses a streaming XML parser, so will extract and write the output files as it parses the `.resx` file
- Can handle `System.Byte[]` data as well as a naïve attempt at extracting `System.Drawing.Bitmap`
- Uses [sindresorhus/file-type](https://github.com/sindresorhus/file-type) to try to determine the filetype and set and appropriate extension

#### Usage

```
npm install
npm start /path/to/file.resx /path/to/output/
```

#### Alternatives

- [soyersoyer/resx2files](https://github.com/soyersoyer/resx2files)
  - Written in Python, only handles `System.Byte[]` and not `System.Drawing.Bitmap`
  - Doesn't set file extensions
- A better solution than all of these (including this project) could probably be written in .NET using [`ResXResourceReader`](https://docs.microsoft.com/dotnet/api/system.resources.resxresourcereader)
