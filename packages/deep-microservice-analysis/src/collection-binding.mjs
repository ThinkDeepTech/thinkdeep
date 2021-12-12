import fetch from 'node-fetch';
import {print} from 'graphql';
import {Binding} from "@thinkdeep/deep-graphql-binding";
import {introspectSchema, wrapSchema} from '@graphql-tools/wrap';

const executor = async ({ document, variables, context }) => {
    const query = print(document);
    const fetchResult = await fetch(process.env.PREDECOS_MICROSERVICE_COLLECTION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            user: !!context?.user ? JSON.stringify(context.user) : null
        },
        body: JSON.stringify({ query, variables })
    });
    return fetchResult.json();
};

class CollectionBinding extends Binding {

    static async create() {

        const schema = wrapSchema({
            schema: await introspectSchema(executor),
            executor
        })

        return new CollectionBinding({
            schema
        });
    }
};

export { CollectionBinding };