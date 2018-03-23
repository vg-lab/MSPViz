# MSPViz (V0.2.6)

## Introduction
MSPViz is a visualization tool for Structural Plasticity Models. It uses a novel visualisation technique based on the representation of the neuronal information through the use of abstract levels and a set of representations into each level. This hierarchical representations, lets the user interact and change the representation modifying the degree of detail of the information to be analysed in an simple and intuitive way, through the navigation of different views at different levels of abstraction. The designed representations in each view only containing the necessary variables to achieve the desired tasks, avoiding overwhelming saturation of information. The multilevel structure and the design of the representations constitutes an approach that provides organized views that facilitates visual analysis tasks. Moreover, each view has been enhanced adding line and bar charts to analyse trends in simulation data, and also filtering and sorting capabilities can be applied on each view easing the analysis. Additionally, some other views, such as connectivity matrices and force directed layouts, have been incorporated, enriching the already existing views and improving the analysis process. Finally, this tool has been optimized to lower render and data loading times, even from remote sources such as WebDav servers. 

## Dependencies
- Required dependencies:
  - Web Browser with HTML5 and JavaScript support (1) (2)
  - PHP 5.2 or above
  - Web Server (php CLI, SimpleHTTPServer, Apache2, ...)

(1) Chrome is the desired web browser as it offers the best performance when using the tool.  
(2) Web Browser extensions may interfere with the tools performance.

## Building
MSPViz is a web tool, thus it is supported in any system that can meet the requiered dependencies. The following command should be enough to build it:

```
git clone --recursive https://github.com/gmrvvis/MSPViz.git
```

## Running
A web server must be started in order to access the tool from the desired Web Browser.
