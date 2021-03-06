import React from 'react';
import { MockedProvider } from '@apollo/react-testing';
import { fireEvent, render, wait } from '@testing-library/react';
import CreateApiPackageForm from '../CreateApiPackageForm';

import {
  apiPackageMock,
  createApiPackageMock,
  refetchApiPackageMock,
  createApiPackageMockWithBasic,
  createApiPackageMockWithOAuth,
  basicCredentialsMock,
  oAuthCredentialsMock,
} from './mocks';

jest.mock('@kyma-project/common', () => ({
  getApiUrl: () => 'kyma.local',
}));

jest.mock('index', () => {
  return {
    CompassGqlContext: {},
  };
});

jest.mock('react-shared', () => ({
  ...jest.requireActual('react-shared'),
  JSONEditor: () => null,
}));
describe('CreateApiPackageForm', () => {
  it('Sends request and shows notification on form submit with no credentials', async () => {
    const formRef = React.createRef();
    const completedCallback = jest.fn();

    const { getByLabelText } = render(
      <MockedProvider
        mocks={[createApiPackageMock, refetchApiPackageMock]}
        addTypename={false}
      >
        <CreateApiPackageForm
          applicationId="app-id"
          formElementRef={formRef}
          onChange={() => {}}
          onCompleted={completedCallback}
          onError={() => {}}
        />
      </MockedProvider>,
    );

    fireEvent.change(getByLabelText(/Name/), {
      target: { value: apiPackageMock.name },
    });
    fireEvent.change(getByLabelText('Description'), {
      target: { value: apiPackageMock.description },
    });

    // simulate form submit from outside
    formRef.current.dispatchEvent(new Event('submit'));

    await wait(() => expect(completedCallback).toHaveBeenCalled());
  });

  it('Sends request and shows notification on form submit with Basic credentials', async () => {
    console.error = jest.fn(); // Warning: `NaN` is an invalid value for the `left` css style property.

    const formRef = React.createRef();
    const completedCallback = jest.fn();

    const { getByLabelText, getByText } = render(
      <MockedProvider
        mocks={[createApiPackageMockWithBasic, refetchApiPackageMock]}
        addTypename={false}
      >
        <CreateApiPackageForm
          applicationId="app-id"
          formElementRef={formRef}
          onChange={() => {}}
          onCompleted={completedCallback}
          onError={() => {}}
        />
      </MockedProvider>,
    );

    fireEvent.change(getByLabelText(/Name/), {
      target: { value: apiPackageMock.name },
    });
    fireEvent.change(getByLabelText('Description'), {
      target: { value: apiPackageMock.description },
    });

    fireEvent.click(getByText('Credentials')); // select tab
    fireEvent.click(getByText('None')); // open dropdown
    fireEvent.click(getByText('Basic')); // select credentials type

    fireEvent.change(getByLabelText(/Username/), {
      target: { value: basicCredentialsMock.username },
    });
    fireEvent.change(getByLabelText(/Password/), {
      target: { value: basicCredentialsMock.password },
    });

    // simulate form submit from outside
    formRef.current.dispatchEvent(new Event('submit'));

    await wait(() => expect(completedCallback).toHaveBeenCalled());
  });

  it('Sends request and shows notification on form submit with OAuth credentials', async () => {
    console.error = jest.fn(); // Warning: `NaN` is an invalid value for the `left` css style property.

    const formRef = React.createRef();
    const completedCallback = jest.fn();

    const { getByLabelText, getByText } = render(
      <MockedProvider
        mocks={[createApiPackageMockWithOAuth, refetchApiPackageMock]}
        addTypename={false}
      >
        <CreateApiPackageForm
          applicationId="app-id"
          formElementRef={formRef}
          onChange={() => {}}
          onCompleted={completedCallback}
          onError={() => {}}
        />
      </MockedProvider>,
    );

    fireEvent.change(getByLabelText(/Name/), {
      target: { value: apiPackageMock.name },
    });
    fireEvent.change(getByLabelText('Description'), {
      target: { value: apiPackageMock.description },
    });

    fireEvent.click(getByText('Credentials')); // select tab
    fireEvent.click(getByText('None')); // open dropdown
    fireEvent.click(getByText('OAuth')); // select credentials type

    fireEvent.change(getByLabelText(/Client ID/), {
      target: { value: oAuthCredentialsMock.clientId },
    });
    fireEvent.change(getByLabelText(/Client Secret/), {
      target: { value: oAuthCredentialsMock.clientSecret },
    });
    fireEvent.change(getByLabelText(/Url/), {
      target: { value: oAuthCredentialsMock.url },
    });

    // simulate form submit from outside
    formRef.current.dispatchEvent(new Event('submit'));

    await wait(() => expect(completedCallback).toHaveBeenCalled());
  });
});
