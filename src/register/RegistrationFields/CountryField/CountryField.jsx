import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import validateCountryField, { COUNTRY_CODE_KEY, COUNTRY_DISPLAY_KEY } from './validator';
import { clearRegistrationBackendError } from '../../data/actions';
import messages from '../../messages';

/**
 * Country field wrapper. It accepts following handlers
 * - handleChange for setting value change and
 * - handleErrorChange for setting error
 *
 * It is responsible for
 * - Auto populating country field if backendCountryCode is available in redux
 * - Performing country field validations
 * - clearing error on focus
 * - setting value on change and selection
 */
const CountryField = (props) => {
  const {
    countryList,
    selectedCountry,
    onChangeHandler,
    handleErrorChange,
    onFocusHandler,
  } = props;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const countryFieldValue = {
    userProvidedText: selectedCountry.displayValue,
    selectionValue: selectedCountry.displayValue,
    selectionId: selectedCountry.countryCode,
  };

  const backendCountryCode = useSelector(state => state.register.backendCountryCode);

  useEffect(() => {
    if (backendCountryCode && backendCountryCode !== selectedCountry?.countryCode) {
      let countryCode = '';
      let countryDisplayValue = '';

      const countryVal = countryList.find(
        (country) => (country[COUNTRY_CODE_KEY].toLowerCase() === backendCountryCode.toLowerCase()),
      );
      if (countryVal) {
        countryCode = countryVal[COUNTRY_CODE_KEY];
        countryDisplayValue = countryVal[COUNTRY_DISPLAY_KEY];
      }
      onChangeHandler(
        { target: { name: 'country' } },
        { countryCode, displayValue: countryDisplayValue },
      );
    } else if (!selectedCountry.displayValue) {
      onChangeHandler(
        { target: { name: 'country' } },
        { countryCode: '', displayValue: '' },
      );
    }
  }, [backendCountryCode, countryList]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnBlur = (event) => {
    // Do not run validations when drop-down arrow is clicked
    if (event.relatedTarget && event.relatedTarget.className.includes('pgn__form-autosuggest__icon-button')) {
      return;
    }

    const { value } = event.target;

    const { error } = validateCountryField(
      value.trim(), countryList, formatMessage(messages['empty.country.field.error']), formatMessage(messages['invalid.country.field.error']),
    );
    handleErrorChange('country', error);
  };

  const handleOnFocus = (event) => {
    handleErrorChange('country', '');
    dispatch(clearRegistrationBackendError('country'));
    onFocusHandler(event);
  };

  const handleOnChange = (value) => {
    onChangeHandler({ target: { name: 'country' } }, { countryCode: value.selectionId, displayValue: value.userProvidedText });

    // We have put this check because proviously we also had onSelected event handler and we call
    // the onBlur on that event handler but now there is no such handler and we only have
    // onChange so we check the is there is proper sectionId which only be
    // proper one when we select it from dropdown's item otherwise its null.
    if (value.selectionId !== '') {
      handleOnBlur({ target: { name: 'country', value: value.userProvidedText } });
    }
  };

  const getCountryList = () => countryList.map((country) => (
    <FormAutosuggestOption key={country[COUNTRY_DISPLAY_KEY]} id={country[COUNTRY_CODE_KEY]}>
      {country[COUNTRY_DISPLAY_KEY]}
    </FormAutosuggestOption>
  ));

  return (
    <div className="mb-5 relative">
      <label htmlFor="country" className="block wuti-label mb-1.5">
        {formatMessage(messages['registration.country.label'])}
      </label>

      <div className="relative">
        <select
          id="country"
          name="country"
          value={countryFieldValue?.selectionId || ''}
          onChange={(e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            handleOnChange({
              selectionId: e.target.value,
              userProvidedText: selectedOption.text,
            });
          }}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          className={`wuti-input appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207l5%205%205-5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] cursor-pointer ${props.errorMessage ? 'wuti-input-error' : ''}`}
        >
          <option value="" disabled>Sélectionner un pays</option>
          {Array.from(new Map(countryList.map(item => [item[COUNTRY_CODE_KEY], item])).values()).map((country) => (
            <option key={`country-opt-${country[COUNTRY_CODE_KEY]}`} value={country[COUNTRY_CODE_KEY]}>
              {country[COUNTRY_DISPLAY_KEY]}
            </option>
          ))}
        </select>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${props.errorMessage ? 'mt-2 max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-xs font-semibold text-red-600 tracking-wide">
          {props.errorMessage}
        </p>
      </div>
    </div>
  );
};

CountryField.propTypes = {
  countryList: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string,
      name: PropTypes.string,
    }),
  ).isRequired,
  errorMessage: PropTypes.string,
  onChangeHandler: PropTypes.func.isRequired,
  handleErrorChange: PropTypes.func.isRequired,
  onFocusHandler: PropTypes.func.isRequired,
  selectedCountry: PropTypes.shape({
    displayValue: PropTypes.string,
    countryCode: PropTypes.string,
  }),
};

CountryField.defaultProps = {
  errorMessage: null,
  selectedCountry: {
    value: '',
  },
};

export default CountryField;
