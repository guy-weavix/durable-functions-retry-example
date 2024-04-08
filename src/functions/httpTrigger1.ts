import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as df from 'durable-functions';
import { OrchestrationContext } from 'durable-functions';

export async function httpTrigger1(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const client = df.getClient(context);
    const body: unknown = await request.text();
    const instanceId: string = await client.startNew('TestOrchestrator');
    context.log(`Started orchestration with ID = '${instanceId}'.`);

    return client.createCheckStatusResponse(request, instanceId);
};

app.http('httpTrigger1', {
    route: 'httpTrigger1',
    extraInputs: [df.input.durableClient()],
    handler: httpTrigger1,
});

interface TestResult {
    retryCount: number,
    text: string,
}  

df.app.orchestration('TestOrchestrator', function* (context: OrchestrationContext) {
    context.log(`TestOrchestrator started`);

    const retryOptions = new df.RetryOptions(1_000, 3);
    context.log(JSON.stringify(retryOptions));
    const result = (yield context.df.callActivityWithRetry('TestActivity', retryOptions, 'hello')) as TestResult;
    context.log(`Activity results. retryCount: ${result.retryCount}, text: ${result.text}`);
    context.log(context, `TestOrchestrator completed`);
    return result;
});

df.app.activity('TestActivity', {
    handler: (text: string, context: InvocationContext): TestResult => {
        context.log(`Started activity with retryCount: ${context.retryContext?.retryCount}/${context.retryContext?.maxRetryCount}`);
        context.log(JSON.stringify(context));

        throw new Error(`boom`);
    },
});