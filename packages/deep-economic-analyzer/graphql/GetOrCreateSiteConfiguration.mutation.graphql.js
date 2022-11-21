import {gql} from 'graphql-tag';

const GetOrCreateSiteConfiguration = gql`
  mutation GetOrCreateSiteConfiguration($userEmail: String!) {
    configuration(userEmail: $userEmail) {
      observedEconomicEntities {
        name
        type
      }
    }
  }
`;

export {GetOrCreateSiteConfiguration};
