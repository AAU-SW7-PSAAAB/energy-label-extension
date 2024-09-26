# Energy Label Extension

An extension that checks the energy efficiency of websites.

## Developing

### Setting up

Make sure you have Nodejs installed, then run:

```sh
npm install
```

### Linting

Run the following command to fully lint your code:

```sh
npm run lint
```

If you don't want all the linting but just want to format your code, run:

```sh
npm run format
```

### Building

Run the following command to build the extension for each browser (with debugging enabled):

```sh
npm run build dev
```

The built extensions can be found in the `public` directory. For your convenience, there is both a zipped and unzipped version.

To build the extension for a release, run:

```sh
npm run build prod
```
