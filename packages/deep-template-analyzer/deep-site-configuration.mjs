import { ApolloMutationController } from '@apollo-elements/core';
import { GetOrCreateSiteConfiguration } from './graphql/GetOrCreateSiteConfiguration.mutation.graphql';
import { html, LitElement } from "lit";
import { getUser } from './user.mjs'

class DeepSiteConfiguration extends LitElement {

    static get properties() {
        return {
            user: {type: Object},
            fetchConfigMutation: {type: Object}
        }
    }

    constructor() {
        super();

        getUser().then((user) => {
            this.user = user;

            this.fetchConfigMutation = new ApolloMutationController(this, GetOrCreateSiteConfiguration, {
                variables: {
                    userEmail: this.user?.profile?.email || null
                },
                onCompleted: (data) => {
                    let event = new CustomEvent('site-configuration', {
                        detail: data
                    });

                    this.dispatchEvent(event);
                }
            });

            this.fetchConfigMutation.mutate();

        }, (reason) => {
            console.log(`Failed to fetch user. Error: ${JSON.stringify(reason)}`);
        });
    }

    render() {
        return html``;
    }
}
customElements.define('deep-site-configuration', DeepSiteConfiguration);