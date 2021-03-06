import { GET_TEMPLATES, GET_COMPASS_APPLICATIONS } from 'gql/queries';
import { REGISTER_APPLICATION_FROM_TEMPLATE } from 'gql/mutations';

const templateNoPlaceholders = {
  id: 1,
  name: 'template-no-placeholders',
  applicationInput: "{name: 'app-name-1'}",
  placeholders: [],
};

const templateWithPlaceholders = {
  id: 2,
  name: 'template-with-placeholders',
  applicationInput: "{name: 'app-name-2'}",
  placeholders: [
    {
      name: 'placeholder-1',
      description: 'placeholder-1-description',
    },
    {
      name: 'placeholder-2',
      description: 'placeholder-2-description',
    },
  ],
};

export const getAppTemplatesQuery = {
  request: {
    query: GET_TEMPLATES,
  },
  result: {
    data: {
      applicationTemplates: {
        data: [templateNoPlaceholders, templateWithPlaceholders],
      },
    },
  },
};

export const registerApplicationMutation = {
  request: {
    query: REGISTER_APPLICATION_FROM_TEMPLATE,
    variables: {
      in: {
        templateName: 'template-with-placeholders',
        values: [
          { placeholder: 'placeholder-1', value: '1' },
          { placeholder: 'placeholder-2', value: '2' },
        ],
      },
    },
  },
  result: jest.fn().mockReturnValue({
    data: {
      registerApplicationFromTemplate: {
        name: 'app-name-2',
      },
    },
  }),
};

export const compassApplicationRefetchQuery = {
  request: {
    query: GET_COMPASS_APPLICATIONS,
  },
  result: jest.fn().mockReturnValue({
    data: {
      applications: {
        data: [
          {
            id: '1',
            name: 'app-name-2',
            providerName: 'providerName',
            packages: [],
          },
        ],
      },
    },
  }),
};
