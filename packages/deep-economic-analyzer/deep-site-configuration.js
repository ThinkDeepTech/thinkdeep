import { ApolloMutationController } from '@apollo-elements/core';
import { GetOrCreateSiteConfiguration } from './graphql/GetOrCreateSiteConfiguration.mutation.graphql';
import { UpdateConfiguration } from './graphql/UpdateConfiguration.mutation.graphql';
import { LitElement } from "lit";
import { getUser } from './user.js'

/**
 * Lit component providing interaction with user site configurations.
 */
class DeepSiteConfiguration extends LitElement {

    /**
     * Lit property declarations.
     */
    static get properties() {
        return {
            user: {type: Object},
            configuration: {
                type: Object,
                hasChanged(newVal, oldVal) {
                    // NOTE: There is duplicated code in the checks below because the 'this' context isn't available.
                    // Make sure to keep them consistent.
                    if (!newVal && newVal === oldVal) return true;

                    if (!newVal && !oldVal) return false;

                    const firstObservedEntities = newVal?.observedEconomicEntities || [];
                    const secondObservedEntities = oldVal?.observedEconomicEntities || [];

                    const sameLength = firstObservedEntities.length === secondObservedEntities.length;

                    if (!firstObservedEntities.length && sameLength) return false;

                    return true;
                }
            },
            fetchConfigMutation: {type: Object},
            updateConfigMutation: {type: Object}
        }
    }

    /**
     * Lit component constructor.
     */
    constructor() {
        super();

        this.configuration = { observedEconomicEntities: [ ]};

        getUser().then((user) => {
            this.user = user;

            this.updateConfigMutation = new ApolloMutationController(this, UpdateConfiguration, {
                variables: {
                    userEmail: this.user?.profile?.email || null,
                    observedEconomicEntities: []
                },
                onCompleted: (data) => {
                    this.configuration = data.updateConfiguration;
                }
            });

            this.fetchConfigMutation = new ApolloMutationController(this, GetOrCreateSiteConfiguration, {
                variables: {
                    userEmail: this.user?.profile?.email || null
                },
                onCompleted: (data) => {
                    this.configuration = data.configuration;
                }
            });

            this.fetchConfigMutation.mutate();

        }, (reason) => {
            console.log(`Failed to fetch user. Error: ${JSON.stringify(reason)}`);
        });
    }

    /**
     * Callback triggered on update of component properties.
     * @param {Set} changedProperties
     */
    updated(changedProperties) {
        if (changedProperties.has('configuration')) {
            const event = new CustomEvent('site-configuration', {
                detail: this.configuration
            });
            this.dispatchEvent(event);
        }
    }

    /**
     * Add the specified economic entity to those observed by the user.
     * @param {Object} economicEntity - Economic entity, i.e { name: 'somename', type: 'BUSINESS'}.
     */
    observeEconomicEntity(economicEntity) {
        if (this.alreadyExists(economicEntity, this.configuration.observedEconomicEntities)) return;
        this.configuration.observedEconomicEntities.push(economicEntity);
    }

    /**
     * Check if an economic entity is already being observed.
     * @param {Object} economicEntity
     * @param {Array} targetEconomicEntities - Economic entities to check against.
     * @return {Boolean} - True if the economic entity is present. False otherwise.
     */
    alreadyExists(economicEntity, targetEconomicEntities) {
        for (const presentEntity of targetEconomicEntities) {
            if (this.equivalent(presentEntity, economicEntity)) return true;
        }
        return false;
    }

    /**
     * Check if two economic entities are equivalent.
     * @param {Object} entity1
     * @param {Object} entity2
     * @return {Boolean} - True if the two are equivalent. False otherwise.
     */
    equivalent(entity1, entity2) {
        const sameName = entity1.name.toLowerCase() === entity2.name.toLowerCase();
        const sameType = entity1.type.toLowerCase() === entity2.type.toLowerCase();
        return sameName && sameType;
    }

    /**
     * Trigger update of the users configuration on the server.
     */
    updateConfiguration() {
        this.updateConfigMutation.variables = {
            userEmail: this.user?.profile?.email || null,
            observedEconomicEntities: this.configuration.observedEconomicEntities || []
        };
        this.updateConfigMutation.mutate();
    }
}
customElements.define('deep-site-configuration', DeepSiteConfiguration);