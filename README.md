# MSPVisualizer

## Introduction
MSPVisualizer is a visualization tool for the Model of Structural Plasticity. It uses a visualisation technique  based on the representation of the neuronal information through the use of abstract levels and a set of schematic representations into each level. The multilevel structure and the design of the representations constitutes an approach that provides organized views that facilitates visual analysis tasks.

## Dependencies
- Required dependencies:
  - Google Chrome 56 or above (1) (2)
  - PHP 5.6 or above

(1) Chrome is the desired web browser as it offers the best performance when using the tool.
(2) Web Browser extensions may interfere with the tools performance.

## Building
- MSPVisualizer is a web tool, thus it is supported in any system capable of running a web browser and a web server with PHP support. The following command should be enough to build it¡:

```
git clone --recursive https://gitlab.gmrv.es/nsviz/mspviz.git
```

## Running
A web server must be started in order to access the tool. Running the following command from the MSPViz directory should be enough if the required dependencies are met:

```
php -S 127.0.0.1:8000 -t .
```

Now, accessing the following URL `127.0.0.1:8000` (1) from Google Chrome should grant access to the tool.

(1) The URL is just an example, the server can be started at any IP and PORT as long as there are enough permission to do so.
