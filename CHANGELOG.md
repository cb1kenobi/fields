0.1.3 (7/29/2013)
-------------------
 * Fixed bug with select fields where relistOnError=true was not firing properly if custom validators returned an error

0.1.2 (7/23/2013)
-------------------
 * Fixed bug set, but undefined default values being rendered as an empty string
 * Fixed bug with default value being a number
 * Run a select field's validate() before checking values against options so values can be transformed
 * Added support for accelerators such as "e__x__it" where "x" is the accelerator and it maps to "exit"

0.1.1 (7/22/2013)
-------------------
 * Fixed bug with a select field instance is used more than once
 * Added screenshots to readme

0.1.0 (7/18/2013)
-------------------
 * Initial release
