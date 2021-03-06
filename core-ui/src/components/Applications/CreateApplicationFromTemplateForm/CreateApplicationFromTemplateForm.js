import React from 'react';
import PropTypes from 'prop-types';
import {
  Menu,
  Dropdown,
  Button,
  Popover,
  FormItem,
  FormLabel,
  FormInput,
} from 'fundamental-react';

import { CompassGqlContext } from 'index';
import { GET_TEMPLATES, GET_COMPASS_APPLICATIONS } from 'gql/queries';
import { REGISTER_APPLICATION_FROM_TEMPLATE } from 'gql/mutations';
import { useQuery, useMutation } from '@apollo/react-hooks';

import './CreateApplicationFromTemplateForm.scss';

const PlaceholderInput = ({
  placeholder: { name, description, value },
  onChange,
}) => (
  <FormItem>
    <FormLabel htmlFor={name}>{description}</FormLabel>
    <FormInput
      id={name}
      type="text"
      value={value}
      placeholder={description}
      onChange={onChange}
      required
    />
  </FormItem>
);

CreateApplicationFromTemplateForm.propTypes = {
  onChange: PropTypes.func,
  onCompleted: PropTypes.func,
  onError: PropTypes.func,
  formElementRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
};

export default function CreateApplicationFromTemplateForm({
  onChange,
  onCompleted,
  onError,
  formElementRef,
}) {
  const compassGqlClient = React.useContext(CompassGqlContext);
  const templatesQuery = useQuery(GET_TEMPLATES, {
    fetchPolicy: 'cache-and-network',
    client: compassGqlClient,
  });
  const [registerApplicationFromTemplate] = useMutation(
    REGISTER_APPLICATION_FROM_TEMPLATE,
    {
      client: compassGqlClient,
      refetchQueries: [{ query: GET_COMPASS_APPLICATIONS }],
    },
  );
  const [template, setTemplate] = React.useState(null);
  const [placeholders, setPlaceholders] = React.useState([]);

  React.useEffect(() => {
    if (template) {
      const placeholders = template.placeholders.map(placeholder => ({
        ...placeholder,
        value: '',
      }));
      setPlaceholders(placeholders);
      onChange(); // revalidate form against new fields
    }
  }, [template, onChange]);

  const AvailableTemplatesList = ({ data, error, loading }) => {
    if (error || loading) {
      return null;
    }

    const templates = data.applicationTemplates
      ? data.applicationTemplates.data
      : [];
    return (
      <Menu>
        {templates.length ? (
          templates.map(template => (
            <Menu.Item key={template.id} onClick={() => setTemplate(template)}>
              {template.name}
            </Menu.Item>
          ))
        ) : (
          <Menu.Item>No templates available</Menu.Item>
        )}
      </Menu>
    );
  };

  const dropdownControlText = () => {
    if (template) {
      return template.name;
    } else if (templatesQuery) {
      const { loading, error, data } = templatesQuery;
      if (error || (!loading && data && !data.applicationTemplates)) {
        // sometimes after an error, there is an empty data object returned. To investigate.
        console.warn(error);
        return 'Error! Cannot load templates list.';
      } else if (loading) {
        return 'Choose template (loading...)';
      } else {
        return 'Choose template';
      }
    }
  };

  const handleFormSubmit = async () => {
    const placeholdersValues = Array.from(
      Object.values(placeholders).map(placeholder => ({
        placeholder: placeholder.name,
        value: placeholder.value,
      })),
    );

    try {
      const result = await registerApplicationFromTemplate({
        variables: {
          in: {
            templateName: template.name,
            values: placeholdersValues,
          },
        },
      });
      const name = result.data.registerApplicationFromTemplate.name;
      onCompleted(`Application "${name}" created successfully`);
    } catch (e) {
      console.warn(e);
      let message = e.message;
      if (e.message.match('Object is not unique')) {
        message = 'Application with that name already exists';
      }
      onError(`Could not unbind Namespace due to an error: ${message}`);
    }
  };

  const content = (
    <form
      ref={formElementRef}
      onChange={onChange}
      onSubmit={handleFormSubmit}
      className="create-application__template-form"
    >
      <Dropdown fullwidth="true">
        <Popover
          body={<AvailableTemplatesList {...templatesQuery} />}
          control={
            <Button className="fd-dropdown__control" typeAttr="button">
              {dropdownControlText()}
            </Button>
          }
          widthSizingType="matchTarget"
        />
      </Dropdown>
      <section className="placeholders-form">
        {placeholders.map(placeholder => (
          <PlaceholderInput
            key={placeholder.name}
            placeholder={placeholder}
            onChange={e =>
              setPlaceholders(
                placeholders.map(p =>
                  p.name === placeholder.name
                    ? { ...p, value: e.target.value }
                    : p,
                ),
              )
            }
          />
        ))}
      </section>
    </form>
  );

  return content;
}
