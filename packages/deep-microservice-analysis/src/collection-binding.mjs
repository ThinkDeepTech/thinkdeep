// import {introspectSchema, wrapSchema} from '@graphql-tools/wrap';
// import {Binding} from "@thinkdeep/deep-graphql-binding";
// import {print} from 'graphql';
// import { getLogger } from './get-logger.mjs';
// import fetch from 'node-fetch';

// const logger = getLogger();

// /**
//  * The executor to be used to handle requests that go to the collection microservice.
//  * @param {Object} data - Data to use when executing the request.
//  * @returns {Object} - Data received from the collection microservice.
//  */
// const executor = async ({ document, variables, context }) => {
//     const query = print(document);

//     logger.debug(`Fetching data from the collection API. Query: ${JSON.stringify(query)}, Variables: ${JSON.stringify(variables)}`);
//     const fetchResult = await fetch(process.env.PREDECOS_MICROSERVICE_COLLECTION_URL, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             permissions: !!context?.permissions ? JSON.stringify(context.permissions) : null
//         },
//         body: JSON.stringify({ query, variables })
//     });
//     return fetchResult.json();
// };

// /**
//  * An object providing access to the collection microservice.
//  */
// class CollectionBinding extends Binding {

//     /**
//      * Create an instance of the class. This allows use of async/await during creation.
//      * @returns {Object} CollectionBinding hooked into the remote endpoint.
//      */
//     static async create() {

//         const schema = wrapSchema({
//             schema: await introspectSchema(executor),
//             executor
//         })

//         return new CollectionBinding({
//             schema
//         });
//     }
// };

// export { CollectionBinding };