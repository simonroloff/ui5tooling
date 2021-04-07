# ui5tooling
reproducing an error in the ui5 build tool

``git clone https://github.com/simonroloff/ui5tooling.git``

``cd ui5tooling``

``npm install @ui5/cli``

``ui5 build``
=> no error. no warning.

``npm i -g eslint``

``eslint ./dist/Component-preload.js``
=> Parsing error: Identifier 'r' has already been declared
