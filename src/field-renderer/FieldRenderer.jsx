import React from 'react';

import PropTypes from 'prop-types';

const FormFieldRenderer = (props) => {
  let formField = null;
  const {
    className, errorMessage, fieldData, onChangeHandler, isRequired, value,
  } = props;

  const handleFocus = (e) => {
    if (props.handleFocus) { props.handleFocus(e); }
  };

  const handleOnBlur = (e) => {
    if (props.handleBlur) { props.handleBlur(e); }
  };

  const errorClass = isRequired && errorMessage ? 'wuti-input-error' : '';

  switch (fieldData.type) {
    case 'select': {
      if (!fieldData.options) {
        return null;
      }
      formField = (
        <div className="mb-5 relative">
          <label htmlFor={fieldData.name} className="block wuti-label mb-1.5">
            {fieldData.label}
          </label>
          <div className="relative">
            <select
              id={fieldData.name}
              className={`wuti-input appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207l5%205%205-5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] cursor-pointer ${className} ${errorClass}`}
              name={fieldData.name}
              value={value}
              aria-invalid={isRequired && Boolean(errorMessage)}
              onChange={onChangeHandler}
              onBlur={handleOnBlur}
              onFocus={handleFocus}
            >
              <option key="default" value="">{fieldData.label}</option>
              {fieldData.options.map(option => (
                <option className="data-hj-suppress" key={option[0]} value={option[0]}>{option[1]}</option>
              ))}
            </select>
          </div>
          {isRequired && errorMessage && (
            <div className="mt-2 text-xs font-semibold text-red-600 tracking-wide">
              {errorMessage}
            </div>
          )}
        </div>
      );
      break;
    }
    case 'textarea': {
      formField = (
        <div className="mb-5 relative">
          <label htmlFor={fieldData.name} className="block wuti-label mb-1.5">
            {fieldData.label}
          </label>
          <textarea
            id={fieldData.name}
            className={`wuti-input min-h-[100px] ${className} ${errorClass}`}
            name={fieldData.name}
            value={value}
            aria-invalid={isRequired && Boolean(errorMessage)}
            onChange={onChangeHandler}
            onBlur={handleOnBlur}
            onFocus={handleFocus}
          />
          {isRequired && errorMessage && (
            <div className="mt-2 text-xs font-semibold text-red-600 tracking-wide">
              {errorMessage}
            </div>
          )}
        </div>
      );
      break;
    }
    case 'text': {
      formField = (
        <div className="mb-5 relative">
          <label htmlFor={fieldData.name} className="block wuti-label mb-1.5">
            {fieldData.label}
          </label>
          <input
            type="text"
            id={fieldData.name}
            className={`wuti-input ${className} ${errorClass}`}
            name={fieldData.name}
            value={value}
            aria-invalid={isRequired && Boolean(errorMessage)}
            onChange={onChangeHandler}
            onBlur={handleOnBlur}
            onFocus={handleFocus}
          />
          {isRequired && errorMessage && (
            <div className="mt-2 text-xs font-semibold text-red-600 tracking-wide">
              {errorMessage}
            </div>
          )}
        </div>
      );
      break;
    }
    case 'checkbox': {
      formField = (
        <div className="text-sm text-neutral-500 my-4">
          <label htmlFor={fieldData.name} className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-start pt-0.5">
              <input
                type="checkbox"
                id={fieldData.name}
                checked={!!value}
                name={fieldData.name}
                value={value}
                aria-invalid={isRequired && Boolean(errorMessage)}
                onChange={onChangeHandler}
                onBlur={handleOnBlur}
                onFocus={handleFocus}
                className={`peer shrink-0 appearance-none w-5 h-5 border-2 rounded-md bg-white
                  checked:bg-brand checked:border-brand
                  focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-1
                  transition-all duration-200 ${className}
                  ${isRequired && errorMessage ? 'border-red-500' : 'border-neutral-300 group-hover:border-brand/50'}
                `}
              />
              <svg
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white stroke-white stroke-[3] transition-opacity duration-200"
                viewBox="0 0 14 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1 5L5 9L13 1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1 leading-relaxed pt-[2px]">
              {fieldData.label}
            </div>
          </label>

          {isRequired && errorMessage && (
            <div className="mt-2 text-xs font-semibold text-red-600 tracking-wide pl-8">
              {errorMessage}
            </div>
          )}
        </div>
      );
      break;
    }
    default:
      break;
  }

  return formField;
};
FormFieldRenderer.defaultProps = {
  className: '',
  value: '',
  handleBlur: null,
  handleFocus: null,
  errorMessage: '',
  isRequired: false,
};

FormFieldRenderer.propTypes = {
  className: PropTypes.string,
  fieldData: PropTypes.shape({
    type: PropTypes.string,
    label: PropTypes.string,
    name: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  }).isRequired,
  onChangeHandler: PropTypes.func.isRequired,
  handleBlur: PropTypes.func,
  handleFocus: PropTypes.func,
  errorMessage: PropTypes.string,
  isRequired: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]),
};

export default FormFieldRenderer;
