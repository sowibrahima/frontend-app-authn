import {
  getAdditionalRegistrationFieldSteps,
  getVisibleRegistrationFieldDescriptions,
  hasAdditionalRegistrationFields,
  isFormValid,
} from '../utils';

describe('Payload validation', () => {
  let formatMessage;
  let configurableFormFields;
  let fieldDescriptions;

  beforeEach(() => {
    formatMessage = jest.fn(msg => msg);
    configurableFormFields = {
      confirm_email: true,
    };
    fieldDescriptions = {};
  });

  test('validates name field correctly', () => {
    const payload = { name: ' ' };
    const errors = {};
    const { isValid, fieldErrors } = isFormValid(
      payload,
      errors,
      configurableFormFields,
      fieldDescriptions,
      formatMessage);

    expect(fieldErrors.name).toBeDefined();
    expect(isValid).toBe(false);
  });

  test('validates email field correctly', () => {
    const payload = { email: 'invalid-email' };
    const errors = {};
    const { isValid, fieldErrors } = isFormValid(
      payload, errors, configurableFormFields, fieldDescriptions, formatMessage);

    expect(fieldErrors.email).toBeDefined();
    expect(isValid).toBe(false);
  });

  test('validates username field correctly', () => {
    const payload = { username: 'invalid username' };
    const errors = {};
    const { isValid, fieldErrors } = isFormValid(
      payload, errors, configurableFormFields, fieldDescriptions, formatMessage);

    expect(fieldErrors.username).toBeDefined();
    expect(isValid).toBe(false);
  });

  test('validates password field correctly', () => {
    const payload = { password: 'short' };
    const errors = {};
    const { isValid, fieldErrors } = isFormValid(
      payload, errors, configurableFormFields, fieldDescriptions, formatMessage);

    expect(fieldErrors.password).toBeDefined();
    expect(isValid).toBe(false);
  });

  test('validates multiple fields correctly', () => {
    const payload = {
      name: 'InvalidName!',
      email: 'invalid-email',
      username: 'invalid username',
      password: 'short',
    };
    const errors = {};
    const { isValid, fieldErrors } = isFormValid(
      payload, errors, configurableFormFields, fieldDescriptions, formatMessage);

    expect(fieldErrors.name).toBeDefined();
    expect(fieldErrors.email).toBeDefined();
    expect(fieldErrors.username).toBeDefined();
    expect(fieldErrors.password).toBeDefined();
    expect(isValid).toBe(false);
  });
});

describe('Additional registration fields visibility', () => {
  const fieldDescriptions = {
    level_of_education: {
      name: 'level_of_education',
      error_message: 'Select your level of education',
      type: 'select',
    },
  };

  test('does not show additional step when dynamic fields are disabled and no other extra fields are enabled', () => {
    const flags = {
      showConfigurableRegistrationFields: false,
      showConfigurableEdxFields: false,
      showMarketingEmailOptInCheckbox: false,
    };

    expect(getVisibleRegistrationFieldDescriptions(fieldDescriptions, flags)).toEqual({});
    expect(getAdditionalRegistrationFieldSteps(fieldDescriptions, flags)).toEqual([]);
    expect(hasAdditionalRegistrationFields(fieldDescriptions, flags)).toBe(false);
  });

  test('shows additional step when dynamic registration fields are enabled', () => {
    const flags = {
      showConfigurableRegistrationFields: true,
      showConfigurableEdxFields: false,
      showMarketingEmailOptInCheckbox: false,
    };

    expect(getVisibleRegistrationFieldDescriptions(fieldDescriptions, flags)).toEqual(fieldDescriptions);
    expect(getAdditionalRegistrationFieldSteps(fieldDescriptions, flags)).toEqual([
      { name: 'level_of_education', type: 'field', fieldData: fieldDescriptions.level_of_education },
    ]);
    expect(hasAdditionalRegistrationFields(fieldDescriptions, flags)).toBe(true);
  });

  test('shows additional step when marketing opt-in is enabled without dynamic fields', () => {
    const flags = {
      showConfigurableRegistrationFields: false,
      showConfigurableEdxFields: false,
      showMarketingEmailOptInCheckbox: true,
    };

    expect(hasAdditionalRegistrationFields({}, flags)).toBe(true);
  });
});
