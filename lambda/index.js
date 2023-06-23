/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
// i18n library dependency, we use it below in a localisation interceptor
const i18n = require('i18next');
// i18n strings for all supported locales
const languageStrings = require('./languageStrings');

// const helloworldDocument = require('./helloworldDocument.json');
const helloworldWithButtonDocument = require('./helloworldWithButtonDocument.json');

// Tokens used when sending the APL directives
const HELLO_WORLD_TOKEN = 'helloworldToken';
const HELLO_WORLD_WITH_BUTTON_TOKEN = 'helloworldWithButtonToken';

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('WELCOME_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelloWorldWithButtonIntentHandler = { // Typo "Hander"
    canHandle(handlerInput){
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldWithButtonIntent';
    },
    handle(handlerInput){
        let speakOutput = "Hello world.";
        let responseBuilder = handlerInput.responseBuilder;
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']){
            
            // Add the RenderDocument directive to the responseBuilder
            responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                token: HELLO_WORLD_WITH_BUTTON_TOKEN,
                document: helloworldWithButtonDocument,
            });
            
            // Tailor the speech for a device with a screen.
            speakOutput += " Welcome to Alexa Presentation Language. Click the button to see what happens!"
        } else {
            speakOutput += " This example would be more interesting on a device with a screen, such as an Echo Show or Fire TV."
        }
        return responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
}

const HelloWorldButtonEventHandler = {
    canHandle(handlerInput){
        // Since an APL skill might have multiple buttons that generate UserEvents,
        // use the event source ID to determine the button press that triggered
        // this event and use the correct handler. In this example, the string 
        // 'fadeHelloTextButton' is the ID we set on the AlexaButton in the document.
        
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.APL.UserEvent'
            && handlerInput.requestEnvelope.request.source.id === 'fadeHelloTextButton';
    },
    handle(handlerInput){
        const speakOutput = "Thank you for clicking the button! I imagine you already noticed that the text faded away. Tell me to start over to bring it back!";
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt("Tell me to start over if you want me to bring the text back into view. Or, you can just say hello again.")
            .getResponse();
    }
}


const StartOverIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StartOverIntent';
    },
    handle(handlerInput) {
        let speakOutput = '';
        let responseBuilder = handlerInput.responseBuilder;
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            speakOutput = "";
            
            // Get the APL visual context information and determine whether the
            // device is displaying the document with the token HELLO_WORLD_WITH_BUTTON_TOKEN
            const contextApl = handlerInput.requestEnvelope.context['Alexa.Presentation.APL'];
            if (contextApl && contextApl.token === HELLO_WORLD_WITH_BUTTON_TOKEN){
                // build an ExecuteCommands directive to change the opacity of the Text component
                // back to 1 so that it displays again. Note that the token included in the
                // directive MUST match the token of the document that is displaying
                
                speakOutput = "OK, I'm going to try to bring that text back into view.";
                
                // Create an APL command that gradually changes the opacity of the 
                // component back to 1 over 3 seconds
                const animateItemCommand = {
                    type: "AnimateItem",
                    componentId: "helloTextComponent",
                    duration: 3000,
                    value: [
                        {
                            property: "opacity",
                            to: 1
                        }
                    ]
                }
                
                // Add the command to an ExecuteCommands directive and add this to
                // the response
                responseBuilder.addDirective({
                    type: 'Alexa.Presentation.APL.ExecuteCommands',
                    token: HELLO_WORLD_WITH_BUTTON_TOKEN,
                    commands: [animateItemCommand]
                })

                
            } else {
                // Device is NOT displaying the expected document, so provide 
                // relevant output speech.
                speakOutput = "Hmm, there isn't anything for me to reset. Try invoking the 'hello world with button intent', then click the button and see what happens!";
            }
        } else {
            speakOutput = "Hello, this sample is more interesting when used on a device with a screen. Try it on an Echo Show, Echo Spot or a Fire TV device.";
        }
        
        return responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('HELLO_MSG');

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']){
            console.log("The user's device supports APL");
        
            const documentName = "HelloWorldDocument"; // Name of the document saved in the authoring tool
            const token = "DocumentToken";
        
            // Add the RenderDocument directive to the response
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                token: token,
                document: {
                    src: 'doc://alexa/apl/documents/' + documentName,
                    type: 'Link'
                },
                datasources: {
                    "helloWorldDataSource": {
                        "primaryText": "Hello World!",
                        "secondaryText": "Welcome to Alexa Presentation Language!",
                        "color": "@colorTeal800"
                    }
                }
            });
            
        } else {
            // Just log the fact that the device doesn't support APL.
            // In a real skill, you might provide different speech to the user.
            console.log("The user's device doesn't support APL. Retest on a device with a screen")
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('HELP_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('GOODBYE_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('FALLBACK_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = handlerInput.t('REFLECTOR_MSG', {intentName: intentName});

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = handlerInput.t('ERROR_MSG');
        console.log(`~~~~ Error handled: ${JSON.stringify(error.stack)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// This request interceptor will bind a translation function 't' to the handlerInput
const LocalisationRequestInterceptor = {
    process(handlerInput) {
        i18n.init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            resources: languageStrings
        }).then((t) => {
            handlerInput.t = (...args) => t(...args);
        });
    }
};
/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldWithButtonIntentHandler,
        HelloWorldButtonEventHandler,
        StartOverIntentHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .addRequestInterceptors(
        LocalisationRequestInterceptor)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();
