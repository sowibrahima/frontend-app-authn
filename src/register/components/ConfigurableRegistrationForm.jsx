import { useEffect, useMemo } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { getCountryList, getLocale, useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import { FormFieldRenderer } from '../../field-renderer';
import { FIELDS } from '../data/constants';
import { getAdditionalRegistrationFieldSteps } from '../data/utils';
import messages from '../messages';
import { CountryField, HonorCode, TermsOfService } from '../RegistrationFields';

/**
 * Fields on registration page that are not the default required fields (name, email, username, password).
 * These configurable required fields are defined on the backend using REGISTRATION_EXTRA_FIELDS setting.
 *
 * Country and Honor Code/Terms of Services (if enabled) will appear at the bottom of the form, even if they
 * appear higher in order returned by backend. This is to make the user experience better.
 *
 * For edX only:
 *  Country and honor code fields are required by default, and we will continue to show them on
 *  frontend even if the API doesn't return it. The `SHOW_CONFIGURABLE_EDX_FIELDS` flag will enable
 *  it for edX.
 * */
const ConfigurableRegistrationForm = (props) => {
  const { formatMessage } = useIntl();
  const {
    email,
    fieldDescriptions,
    fieldErrors,
    formFields,
    setFieldErrors,
    setFormFields,
    autoSubmitRegistrationForm,
    activeFieldIndex,
    wizardMode,
  } = props;

  /** The reason for adding the entry 'United States' is that Chrome browser aut-fill the form with the 'Unites
  States' instead of 'United States of America' which does not exist in country dropdown list and gets the user
  confused and unable to create an account. So we added the United States entry in the dropdown list.
 */
  const countryList = useMemo(() => getCountryList(getLocale()).concat([{ code: 'US', name: 'United States' }]), []);

  const flags = {
    showConfigurableRegistrationFields: getConfig().ENABLE_DYNAMIC_REGISTRATION_FIELDS,
    showConfigurableEdxFields: getConfig().SHOW_CONFIGURABLE_EDX_FIELDS,
    showMarketingEmailOptInCheckbox: getConfig().MARKETING_EMAILS_OPT_IN,
  };
  const fieldSteps = getAdditionalRegistrationFieldSteps(fieldDescriptions, flags);

  /**
   * If auto submitting register form, we will check tos and honor code fields if they exist for feature parity.
   */
  useEffect(() => {
    if (autoSubmitRegistrationForm) {
      if (Object.keys(fieldDescriptions).includes(FIELDS.HONOR_CODE)) {
        setFormFields(prevState => ({
          ...prevState,
          [FIELDS.HONOR_CODE]: true,
        }));
      }
      if (Object.keys(fieldDescriptions).includes(FIELDS.TERMS_OF_SERVICE)) {
        setFormFields(prevState => ({
          ...prevState,
          [FIELDS.TERMS_OF_SERVICE]: true,
        }));
      }
    }
  }, [autoSubmitRegistrationForm]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleErrorChange = (fieldName, error) => {
    if (fieldName) {
      setFieldErrors(prevErrors => ({
        ...prevErrors,
        [fieldName]: error,
      }));
    }
  };

  const handleOnChange = (event, countryValue = null) => {
    const { name } = event.target;
    let value;
    if (countryValue) {
      value = { ...countryValue };
    } else {
      value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      if (event.target.type === 'checkbox') {
        setFieldErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
      }
    }
    setFormFields(prevState => ({ ...prevState, [name]: value }));
  };

  const handleOnBlur = (event) => {
    const { name, value } = event.target;
    let error = '';
    if ((!value || !value.trim()) && fieldDescriptions[name]?.error_message) {
      error = fieldDescriptions[name].error_message;
    } else if (name === 'confirm_email' && value !== email) {
      error = formatMessage(messages['email.do.not.match']);
    }
    setFieldErrors(prevErrors => ({ ...prevErrors, [name]: error }));
  };

  const handleOnFocus = (event) => {
    const { name } = event.target;
    setFieldErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
  };

  const renderFieldStep = (fieldStep) => {
    if (!fieldStep) {
      return null;
    }

    switch (fieldStep.type) {
      case 'country':
        return (
          <span key="country">
            <CountryField
              countryList={countryList}
              selectedCountry={formFields.country}
              errorMessage={fieldErrors.country || ''}
              onChangeHandler={handleOnChange}
              handleErrorChange={handleErrorChange}
              onBlurHandler={handleOnBlur}
              onFocusHandler={handleOnFocus}
            />
          </span>
        );
      case 'marketing_email_opt_in':
        return (
          <span key="marketing_email_opt_in">
            <FormFieldRenderer
              fieldData={{
                type: 'checkbox',
                label: formatMessage(messages['registration.opt.in.label'], { siteName: getConfig().SITE_NAME }),
                name: 'marketingEmailsOptIn',
              }}
              value={formFields.marketingEmailsOptIn}
              className="form-field--checkbox"
              onChangeHandler={handleOnChange}
              handleBlur={handleOnBlur}
              handleFocus={handleOnFocus}
            />
          </span>
        );
      case 'tos_and_honor_code':
        return (
          <span key="honor_code">
            <HonorCode fieldType="tos_and_honor_code" onChangeHandler={handleOnChange} value={formFields.honor_code} />
          </span>
        );
      case 'honor_code':
        return (
          <span key={fieldStep.name}>
            <HonorCode
              fieldType={fieldStep.fieldData.type}
              value={formFields[fieldStep.name]}
              onChangeHandler={handleOnChange}
              errorMessage={fieldErrors[fieldStep.name]}
            />
          </span>
        );
      case 'terms_of_service':
        return (
          <span key={fieldStep.name}>
            <TermsOfService
              value={formFields[fieldStep.name]}
              onChangeHandler={handleOnChange}
              errorMessage={fieldErrors[fieldStep.name]}
            />
          </span>
        );
      default:
        return (
          <span key={fieldStep.name}>
            <FormFieldRenderer
              fieldData={fieldStep.fieldData}
              value={formFields[fieldStep.name]}
              onChangeHandler={handleOnChange}
              handleBlur={handleOnBlur}
              handleFocus={handleOnFocus}
              errorMessage={fieldErrors[fieldStep.name]}
              isRequired
            />
          </span>
        );
    }
  };

  if (wizardMode) {
    const boundedFieldIndex = Math.min(activeFieldIndex, fieldSteps.length - 1);
    const activeFieldStep = fieldSteps[boundedFieldIndex];
    const progressPercent = fieldSteps.length ? ((boundedFieldIndex + 1) / fieldSteps.length) * 100 : 0;

    return (
      <div className="wuti-extra-fields-wizard">
        <div className="wuti-extra-fields-progress" aria-hidden="true">
          <div className="wuti-extra-fields-progress__track">
            <div
              className="wuti-extra-fields-progress__bar"
              style={{ transform: `scaleX(${progressPercent / 100})` }}
            />
          </div>
          <span className="wuti-extra-fields-progress__count">
            {formatMessage(messages['registration.additional.info.progress'], {
              current: boundedFieldIndex + 1,
              total: fieldSteps.length,
            })}
          </span>
        </div>
        <div className="wuti-extra-fields-step" key={activeFieldStep?.name}>
          {renderFieldStep(activeFieldStep)}
        </div>
      </div>
    );
  }

  return (
    <>
      {fieldSteps.map(renderFieldStep)}
    </>
  );
};

ConfigurableRegistrationForm.propTypes = {
  activeFieldIndex: PropTypes.number,
  email: PropTypes.string.isRequired,
  fieldDescriptions: PropTypes.shape({}),
  fieldErrors: PropTypes.shape({
    country: PropTypes.string,
  }).isRequired,
  formFields: PropTypes.shape({
    country: PropTypes.shape({
      displayValue: PropTypes.string,
      countryCode: PropTypes.string,
    }),
    honor_code: PropTypes.bool,
    marketingEmailsOptIn: PropTypes.bool,
  }).isRequired,
  setFieldErrors: PropTypes.func.isRequired,
  setFormFields: PropTypes.func.isRequired,
  autoSubmitRegistrationForm: PropTypes.bool,
  wizardMode: PropTypes.bool,
};

ConfigurableRegistrationForm.defaultProps = {
  activeFieldIndex: 0,
  fieldDescriptions: {},
  autoSubmitRegistrationForm: false,
  wizardMode: false,
};

export default ConfigurableRegistrationForm;
