/**
 * regtable.h
 *
 * List of registers. Header file.
 *
 * Product name: test (12)
 * Author: instaltic
 * Creation date: 12 may 2014
 */
#ifndef _REGTABLE_H
#define _REGTABLE_H

#include "Arduino.h"
#include "register.h"
#include "commonregs.h"

/**
 * Register indexes
 */
DEFINE_REGINDEX_START()
  // First index here = 11
  REGI_SADAS,
  REGI_DASDAS
DEFINE_REGINDEX_END()

#endif

