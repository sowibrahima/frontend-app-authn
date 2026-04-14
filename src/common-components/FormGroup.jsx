import React, { useState } from 'react';

import PropTypes from 'prop-types';

const FormGroup = (props) => {
  const [hasFocus, setHasFocus] = useState(false);

  const handleFocus = (e) => {
    setHasFocus(true);
    if (props.handleFocus) { props.handleFocus(e); }
  };
  const handleClick = (e) => {
    if (props.handleClick) { props.handleClick(e); }
  };
  const handleOnBlur = (e) => {
    setHasFocus(false);
    if (props.handleBlur) { props.handleBlur(e); }
  };

  return (
    <div className={`relative ${props.className || 'mb-5'}`}>
      {/* Label */}
      <label
        htmlFor={props.name}
        className="block wuti-label mb-1.5"
      >
        {props.floatingLabel}
      </label>

      {/* Input wrapper */}
      <div className="relative">
        {props.as === 'textarea' ? (
          <textarea
            id={props.name}
            name={props.name}
            value={props.value}
            readOnly={props.readOnly}
            spellCheck={props.spellCheck}
            placeholder={props.placeholder}
            onFocus={handleFocus}
            onBlur={handleOnBlur}
            onClick={handleClick}
            onChange={props.handleChange}
            className={`wuti-input min-h-[100px] ${props.errorMessage ? 'wuti-input-error' : ''} ${props.borderClass}`}
          />
        ) : props.as === 'select' ? (
          <select
            id={props.name}
            name={props.name}
            value={props.value}
            onFocus={handleFocus}
            onBlur={handleOnBlur}
            onClick={handleClick}
            onChange={props.handleChange}
            className={`wuti-input appearance-none bg-no-repeat bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%207l5%205%205-5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] ${props.errorMessage ? 'wuti-input-error' : ''} ${props.borderClass}`}
          >
            {props.options ? props.options() : null}
          </select>
        ) : (
          <input
            id={props.name}
            name={props.name}
            type={props.type}
            value={props.value}
            readOnly={props.readOnly}
            autoComplete={props.autoComplete}
            spellCheck={props.spellCheck}
            placeholder={props.placeholder}
            onFocus={handleFocus}
            onBlur={handleOnBlur}
            onClick={handleClick}
            onChange={props.handleChange}
            className={`wuti-input ${props.errorMessage ? 'wuti-input-error' : ''} ${props.type === 'password' ? 'wuti-input-password' : ''} ${props.borderClass}`}
          />
        )}

        {/* Trailing element (e.g., password toggle icon) */}
        {props.trailingElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {props.trailingElement}
          </div>
        )}
      </div>

      {/* Reserved space for help and error text to prevent layout shift */}
      <div className="mt-1 min-h-[20px] flex flex-col justify-start mb-2">
        {props.errorMessage ? (
          <p className="text-xs font-semibold text-red-600 tracking-wide animate-[fadeIn_0.2s_ease-out]">
            {props.errorMessage}
          </p>
        ) : hasFocus && props.helpText && props.helpText.length > 0 ? (
          <div className="animate-[fadeIn_0.2s_ease-out]">
            {props.helpText?.map((message, index) => (
              <p key={`help-text-${index}`} className="text-xs text-neutral-500 mb-0.5 leading-relaxed">
                {message}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      {props.children}
    </div>
  );
};

FormGroup.defaultProps = {
  as: 'input',
  autoComplete: null,
  borderClass: '',
  children: null,
  className: '',
  errorMessage: '',
  handleBlur: null,
  handleChange: () => { },
  handleClick: null,
  handleFocus: null,
  helpText: [],
  options: null,
  spellCheck: null,
  placeholder: null,
  trailingElement: null,
  type: 'text',
};

FormGroup.propTypes = {
  as: PropTypes.string,
  autoComplete: PropTypes.string,
  borderClass: PropTypes.string,
  children: PropTypes.element,
  className: PropTypes.string,
  errorMessage: PropTypes.string,
  floatingLabel: PropTypes.string.isRequired,
  handleBlur: PropTypes.func,
  handleChange: PropTypes.func,
  handleClick: PropTypes.func,
  handleFocus: PropTypes.func,
  helpText: PropTypes.arrayOf(PropTypes.string),
  name: PropTypes.string.isRequired,
  options: PropTypes.func,
  readOnly: PropTypes.bool,
  spellCheck: PropTypes.string,
  placeholder: PropTypes.string,
  trailingElement: PropTypes.element,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
};

export default FormGroup;
