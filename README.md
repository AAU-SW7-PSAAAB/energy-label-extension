# Green Machine Extension

An extension that checks the energy efficiency of websites.

## Developing

### Setting up

#### Cloning

Cloning the repository:

```sh
git clone https://github.com/AAU-SW7-PSAAAB/energy-label-extension.git
```

After cloning you have to cd into the folder and initialize the local submodule configuration file:

```sh
git submodule init
```

Finally you have to run the following to fetch the data for the listed submodules:

```sh
git submodule update
```

#### Installing dependencies

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

### Running locally

Run the following command to automatically rebuild the extension whenever something changes:

```sh
npm run dev
```

Open another terminal and run the following commands in-which you replace `browser` with either `chromium`, `firefox`, or `safari`:

```sh
cd publish/browser
npx web-ext run
```

This will only work if you have Firefox installed locally. You can also run it with Chromium browsers.

You can find more documentation on `web-ext` here: https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/
..or with `npx web-ext --help`.

## Publishing

Run the following command to build the extension for each browser:

```sh
npm run build
```

The built extensions can be found in the `publish` directory. For your convenience, there is both a zipped and unzipped version.

## Benchmarking

Two benchmarks have been created: one testing the availability and one testing the performance.

### Performance

Run the following command to run the automated playwright based benchmark.

```sh
npm run test:benchmark:performance
```

When finished, the generated data can be found in the `tests/benchmark/performance` folder. This data includes information about the time it takes from starting an analysis and the first result being shown.

### Availability

This test requires a maria-db and an instance of energy-label-log-server to be running and the data is then found in the database.

To run the availability test run the following command:

```sh
npm run test:benchmark:availability
```
