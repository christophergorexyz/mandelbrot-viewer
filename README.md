# mandelbrot-viewer 

🌈🌈🌈🌈🌈🌈🌈 

A viewer for the mandelbrot set [http://theoutliar.github.io/mandelbrot-viewer/](http://theoutliar.github.io/mandelbrot-viewer/) 

Each coordinate in Real (ℝ) space represents the components of a complex number. 

The colorization is achieved by testing whether the iterative application of a certain function to those components results in divergence from particular boundaries. 

If a certain number of iterative tests fails to result in divergence, we can conclude it's "close enough" to represent a member of the set for a given zoom level, and color it black. 

If we've determined that the iterative application of the function results in divergence, we can color it according to a particular palette. The index of the color to use within that palette is given by the modulus division of the number of iterations necessary to make that determination by the length of a the color palette. 

🌈🌈🌈🌈🌈🌈🌈 