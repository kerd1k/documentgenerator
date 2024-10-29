# DocumentGenerator

Generate Json from JavaDoc comments

## Parameters

-   --source - source directory path where to parse comments
-   --endpoint - Endpoint to prepend in doc fullPath
-   --destination - file path where to save JSON file with generated content (example: doc.json)
-   --inject - file path where to inject (replace) generated content
-   --injectVariable - variable to replace with generated content (default: {{docjson}})
-   --template - template file path where to put default template

## Examples:

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

## TODOS

-   Create tests
-   Parameters from configuration file - check for file exists and parse it (args)
