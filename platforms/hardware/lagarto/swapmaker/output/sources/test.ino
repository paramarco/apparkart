/**
 * test.ino
 *
 * Instructions
 *
 * Product name: test (12)
 * Author: instaltic
 * Creation date: 12 may 2014
 */
*********************************************************************************************
This file has been automatically generated by SWAPmaker
*********************************************************************************************

"output" subfolder, under your local copy of SWAPmaker, contains the following files
generated by the wizard:

Definition files:
******************

devices.xml:
Device directory file. All SWAP-compatible devices have to include its own line into this file.
For your developments, manually copy your generated "dev" line into your working copies of
devices.xml and set update=false from settings.xml 

test (12).xml:
This file defines your device, its configuration registers, inputs and outputs. For your
developments, you will need to place it into your local copy of "devices" and set "update" to
false in your settings.xml files. Doing this, SWAPdmt, Lagarto and any other pyswap-based
application will be able to discover your device and work with it. Later, once your developments
finished, you may want to submit this file and devices.xml to devices@panstamp.com in order
for other users to play with your devices and developments.


Source files:
******************

sources/test (12).ino: main sketch file.
sources/product:h: file containing hardware/firmware versions and product code.
sources/regtable.ino: definition of SWAP registers and callback functions.
sources/regtable.h: register indexes.

The above source files have to be contained into a new directory named "test (12)".
This is a requirement of the Arduino IDE.
