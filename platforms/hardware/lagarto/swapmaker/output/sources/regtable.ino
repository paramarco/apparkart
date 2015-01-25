/**
 * regtable.ino
 *
 * List of registers. Definition and handlers.
 *
 * Product name: test (12)
 * Author: instaltic
 * Creation date: 12 may 2014
 */
#include <EEPROM.h>
#include "product.h"
#include "panstamp.h"
#include "regtable.h"

/**
 * Declaration of common callback functions
 */
DECLARE_COMMON_CALLBACKS()

/**
 * Definition of common registers
 */
DEFINE_COMMON_REGISTERS()

/*
 * Definition of custom registers
 */
static byte dtsadas[0];
REGISTER regsadas(dtsadas, sizeof(dtsadas), NULL, &setsadas);
static byte dtdasdas[0];
REGISTER regdasdas(dtdasdas, sizeof(dtdasdas), NULL, &setdasdas);


/**
 * Initialize table of registers
 */
DECLARE_REGISTERS_START()
  // Pointers to the custom registers
  &regsadas,
  &regdasdas
DECLARE_REGISTERS_END()

/**
 * Definition of common getter/setter callback functions
 */
DEFINE_COMMON_CALLBACKS()

/**
 * Definition of custom getter/setter callback functions
 */
/**
 * setsadas
 *
 * Set sadas
 *
 * rId: register ID
 * value: new value
*/
const void setsadas(byte rId, byte *value)
{
  // Update register value:
  memcpy(regTable[rId]->value, value, sizeof(regTable[rId]->value));

  // Change your outputs or variables here:
}

/**
 * setdasdas
 *
 * Set dasdas
 *
 * rId: register ID
 * value: new value
*/
const void setdasdas(byte rId, byte *value)
{
  // Update register value:
  memcpy(regTable[rId]->value, value, sizeof(regTable[rId]->value));

  // Change your outputs or variables here:
}



