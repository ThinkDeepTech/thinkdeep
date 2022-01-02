import { ApolloMutationController } from '@apollo-elements/core';
import { GetOrCreateSiteConfiguration } from './graphql/GetOrCreateSiteConfiguration.mutation.graphql';
import { UpdateConfiguration } from './graphql/UpdateConfiguration.mutation.graphql';
import { html, LitElement } from "lit";
import { getUser } from './user.mjs'

class DeepSiteConfiguration extends LitElement {

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

                    let foundEntries = [];
                    for (const entityInFirst of firstObservedEntities) {

                        let foundEntry = false;
                        for (const entityInSecond of secondObservedEntities) {

                            const sameName = entityInFirst.name.toLowerCase() === entityInSecond.name.toLowerCase();
                            const sameType = entityInFirst.type.toLowerCase() === entityInSecond.type.toLowerCase();
                            if (sameName && sameType) {
                                foundEntry = true;
                            }
                        }
                        foundEntries.push(foundEntry);
                    }

                    const foundAllEntries = foundEntries.every((currentValue) => currentValue === true);

                    return !sameLength || !foundAllEntries;
                }
            },
            fetchConfigMutation: {type: Object},
            updateConfigMutation: {type: Object}
        }
    }

    constructor() {
        super();

        this.configuration = { observedEconomicEntities: [ ]};

        getUser().then((user) => {
            this.user = user;

            this.updateConfigMutation = new ApolloMutationController(this, UpdateConfiguration, {
                variables: {
                    userEmail: this.user?.profile?.email || null,
                    observedEconomicEntities: []
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

    updated(changedProperties) {
        if (changedProperties.has('configuration')) {
            let event = new CustomEvent('site-configuration', {
                detail: this.configuration
            });
            this.dispatchEvent(event);
        }
    }

    /**
     * Add the specified economic entity to those observed by the user.
     * @param {Object} economicEntity - Economic entity, i.e { name: 'somename', type: 'BUSINESS'}.
     * @returns
     */
    observeEconomicEntity(economicEntity) {
        if (this.alreadyExists(economicEntity, this.configuration.observedEconomicEntities)) return;
        this.configuration.observedEconomicEntities.push(economicEntity);
    }

    /**
     * Check if an economic entity is already being observed.
     * @param {Object} economicEntity
     * @param {Array} targetEconomicEntities - Economic entities to check against.
     * @returns {Boolean} - True if the economic entity is present. False otherwise.
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
     * @returns {Boolean} - True if the two are equivalent. False otherwise.
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