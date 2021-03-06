import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { ApolloLink } from 'apollo-link';
import { withClientState } from 'apollo-link-state';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from 'apollo-link-error';
import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { getConfigValue } from './getConfigValue';

import resolvers from './resolvers';
import defaults from './defaults';

const COMPASS_GRAPHQL_ENDPOINT = getConfigValue('compassApiUrl');

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: {
    __schema: {
      types: [],
    },
  },
});
function handleUnauthorized() {
  window.parent.postMessage('unauthorized', '*');
}

export function createApolloClient(tenant, token) {
  const httpLink = createHttpLink({
    uri: COMPASS_GRAPHQL_ENDPOINT,
  });
  const authLink = setContext((_, { headers }) => {
    const headersVal = {
      ...headers,
      authorization: token,
    };
    if (tenant && tenant !== '') {
      headersVal.tenant = tenant;
    }
    return {
      headers: headersVal,
    };
  });
  const authHttpLink = authLink.concat(httpLink);

  const cache = new InMemoryCache({ fragmentMatcher });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (networkError && networkError.statusCode === 401) {
      return handleUnauthorized();
    }

    if (process.env.REACT_APP_ENV !== 'production') {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      }

      if (networkError) console.log(`[Network error]: ${networkError}`);
    }
  });

  const stateLink = withClientState({
    cache,
    defaults,
    resolvers,
  });

  const client = new ApolloClient({
    uri: COMPASS_GRAPHQL_ENDPOINT,
    cache,
    link: ApolloLink.from([stateLink, errorLink, authHttpLink]),
    connectToDevTools: true,
  });

  return client;
}
