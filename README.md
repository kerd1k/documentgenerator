# DocumentGenerator

Generate Json from JavaDoc comments

## Parameters

-   --source - source directory path where to parse comments
-   --endpoint - Endpoint to prepend in doc fullPath
-   --destination - file path where to save JSON file with generated content (example: doc.json)
-   --inject - file path where to inject (replace) generated content
-   --injectVariable - variable to replace with generated content (default: {{docjson}})
-   --template - template file path where to put default template

## Use examples:

Inject:

`documentgenerator --source=./src/ --endpoint=auth --injectFileName=template.html --injectVariable="{{docjson}}"`

Save to file:

`documentgenerator  --source=./src/ --endpoint=auth --destination=./bin/doc.json`

Copy template:

`documentgenerator  --source=./src/ --endpoint=auth --template=./documentation.html`

Copy template and inject:

`documentgenerator  --source=./src/ --endpoint=auth --template=./documentation.html --injectFileName=documentation.html --injectVariable="{{docjson}}"`

Copy template, inject in it and save to file:

`documentgenerator  --source=./src/ --endpoint=auth --destination=./bin/doc.json --template=./documentation.html --injectFileName=documentation.html --injectVariable="{{docjson}}"`

## Comments example

```
	/**
    *
    * Comment example with
    * multiple lines
    * but will be ignored of description tag at the bottom
    *
    * @author - Aleksejs Cetverikovs <kerd1k@gmail.com>
    * @method GET
    *
    * @param {Object} employee - The employee who is responsible for the project.
    * @param {string} employee.name - The name of the employee.
    * @param {string} employee.department - The employee's department.
    * @param {Object[]} employees - The employees who are responsible for the project.
    * @param {string} employees[].name - The name of an employee.
    * @param {string} employees[].department - The employee's department.
    * @param {string} somebody - Somebody's name.
    * @param {string} [somebody] - Somebody's name.
    * @param {string} [somebody=John Doe] - Somebody's name.
    * @param {string} [somebody=John Doe] Somebody's name.
    * @param {(string|string[])} [somebody=John Doe] - Somebody's name, or an array of names.

    * @throws {InvalidArgumentException}
    * @throws - Will throw an error if the argument is null.
    * @throws {DivideByZero} - Argument x must be non-zero.

    * @returns {TransferPacketVO<any>} - response object
    *
    * @example
		* http://localhost:8015/api/v1/example/test?test=test - will return {data:true}
    *
    * @example
    * http://localhost:8015/api/v1/example/test - will return error

    * @description - TestDocs route
    *
	 */
```

## JSON after parsing example

```
  "/api/doc": {
    "": {
      "handler": "getDoc",
      "ignoreInterceptor": "true",
      "fullPath": "/api/doc/",
      "description": "TestDocs route",
      "method": "GET",
      "parameters": [
        {
          "name": "employee",
          "type": "Object",
          "description": "The employee who is responsible for the project.",
          "optional": false
        },
        {
          "name": "employee.name",
          "type": "string",
          "description": "The name of the employee.",
          "optional": false
        },
        {
          "name": "employee.department",
          "type": "string",
          "description": "The employee's department.",
          "optional": false
        },
        {
          "name": "employees",
          "type": "Object[]",
          "description": "The employees who are responsible for the project.",
          "optional": false
        },
        {
          "name": "employees[].name",
          "type": "string",
          "description": "The name of an employee.",
          "optional": false
        },
        {
          "name": "employees[].department",
          "type": "string",
          "description": "The employee's department.",
          "optional": false
        },
        {
          "name": "somebody",
          "type": "string",
          "description": "Somebody's name.",
          "optional": false
        },
        {
          "name": "somebody",
          "type": "string",
          "description": "Somebody's name.",
          "optional": true
        },
        {
          "name": "somebody",
          "type": "string",
          "description": "Somebody's name.",
          "optional": true,
          "default": "John Doe"
        },
        {
          "name": "somebody",
          "type": "string",
          "description": "Somebody's name.",
          "optional": true,
          "default": "John Doe"
        },
        {
          "name": "somebody",
          "type": "(string|string[])",
          "description": "Somebody's name, or an array of names.",
          "optional": true,
          "default": "John Doe"
        }
      ],
      "throws": [
        {
          "name": "",
          "type": "InvalidArgumentException",
          "description": ""
        },
        {
          "name": "",
          "type": "",
          "description": "Will throw an error if the argument is null."
        },
        {
          "name": "",
          "type": "DivideByZero",
          "description": "Argument x must be non-zero."
        }
      ],
      "returns": [
        {
          "name": "",
          "type": "TransferPacketVO<any>",
          "description": "response object"
        }
      ],
      "example": [
        "http://localhost:8015/api/v1/example/test?test=test - will return {data:true}",
        "http://localhost:8015/api/v1/example/test - will return error"
      ]
    },
```

## TODOS

-   Comments before endpoints - regex
-   Create tests
-   Parameters from configuration file - check for file exists and parse it (args)
