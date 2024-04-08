# durable-functions-retry-example
Demonstrates a problem with durable function's retry context being null

Based on documentation, you would expect the retryContext property of InvocationContext to have a value if you executed the activity with retry options.

To execute this example, you can do these steps:

- run 'npm install'
- run 'mkdir azurite'
- run './node_modules/.bin/azurite --location ./azurite --debug ./azurite/debug.log'
- press F5 to start the project
- run 'curl http://localhost:7071/api/httpTrigger1'


In the logs you will see a line like this:
{"firstRetryIntervalInMilliseconds":1000,"maxNumberOfAttempts":3}

This log asserts that a retry option is created and that option is passed into when the orchestrator calls the activity.

When the activity executes, I would expect that the instance of InvocationContext passed in would be populated, but it is not. You will see in the JSON object printed in the logs that the retryContext is not present and you will see this line in the logs:

Started activity with retryCount: undefined/undefined

You will see that the activity is called three times and then the orchestrator errs out. This proves that the retry options are being honored.