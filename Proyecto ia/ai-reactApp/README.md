# ai-reactApp

GUI using React for the Hex game. In this example, we have agent that makes a random move at each turn. 
The aim of this project is to serve as a debug tool for the programming of a real intelligent agent that plays Hex like a master.

## Install

Just run in the command line:

``` bash
npm install
```

# Run

```bash
npm start
```

## Description

Your entry point must be the [HextAgent](https://github.com/andcastillo/ai-reactApp/blob/master/modelHex/HexAgent.js). Basically, you must to implement the **send()** function in order to play better moves each turn. As this is a debug tool, both players will use the same logic, although you are free to modify the source code to admit 2 different implementations of the HexAgent.
