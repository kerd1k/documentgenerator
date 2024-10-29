# DocumentGenerator

Generate Json from JavaDoc comments

## Parameters

-   --source
-   --endpoint
-   --destination
-   --destinationFileName
-   --injectFileName
-   --injectVariable

### example:

`--source=./src/ --endpoint=auth --injectFileName=template.html --inje
ctVariable="{json}" --destination=./bin/ --destinationFileName=doc.json`

## TODOS

-   Template file in root folder for save
-   Create tests
-   Parameters from configuration file - check for file exists and parse it (args)
