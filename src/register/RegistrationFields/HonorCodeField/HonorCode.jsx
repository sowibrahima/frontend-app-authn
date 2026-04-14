import { useEffect } from 'react';

import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import messages from '../../messages';

const HonorCode = (props) => {
  const { formatMessage } = useIntl();
  const {
    errorMessage, onChangeHandler, fieldType, value,
  } = props;

  useEffect(() => {
    if (fieldType === 'tos_and_honor_code' && !value) {
      onChangeHandler({ target: { name: 'honor_code', value: true } });
    }
  }, [fieldType, onChangeHandler, value]);

  if (fieldType === 'tos_and_honor_code') {
    return (
      <div id="honor-code" className="text-sm text-neutral-500 my-4 leading-relaxed bg-neutral-bg p-4 rounded-xl border border-neutral-100">
        <FormattedMessage
          id="register.page.terms.of.service.and.honor.code"
          defaultMessage="By creating an account, you agree to the {tosAndHonorCode} and you acknowledge that {platformName} and each
                Member process your personal data in accordance with the {privacyPolicy}."
          description="Text that appears on registration form stating honor code and privacy policy"
          values={{
            platformName: <span className="font-medium text-neutral-900">{getConfig().SITE_NAME}</span>,
            tosAndHonorCode: (
              <a
                className="text-brand hover:underline font-medium"
                href={getConfig().TOS_AND_HONOR_CODE || '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {formatMessage(messages['terms.of.service.and.honor.code'])}
              </a>
            ),
            privacyPolicy: (
              <a
                className="text-brand hover:underline font-medium"
                href={getConfig().PRIVACY_POLICY || '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                {formatMessage(messages['privacy.policy'])}
              </a>
            ),
          }}
        />
      </div>
    );
  }

  return (
    <div id="honor-code" className="text-sm text-neutral-500 my-4">
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex items-start pt-0.5">
          <input
            type="checkbox"
            id="honor-code-checkbox"
            checked={value}
            name="honor_code"
            value={value}
            onChange={onChangeHandler}
            className={`peer shrink-0 appearance-none w-5 h-5 border-2 rounded-md bg-white
              checked:bg-brand checked:border-brand
              focus:outline-none focus:ring-2 focus:ring-brand/20 focus:ring-offset-1
              transition-all duration-200
              ${errorMessage ? 'border-red-500' : 'border-neutral-300 group-hover:border-brand/50'}`}
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
          <FormattedMessage
            id="register.page.honor.code"
            defaultMessage="I agree to the {platformName}&nbsp;{tosAndHonorCode}"
            description="Text that appears on registration form stating honor code"
            values={{
              platformName: getConfig().SITE_NAME,
              tosAndHonorCode: (
                <a
                  href={getConfig().TOS_AND_HONOR_CODE || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline font-medium"
                >
                  {formatMessage(messages['honor.code'])}
                </a>
              ),
            }}
          />
        </div>
      </label>

      {errorMessage && (
        <p className="mt-2 text-xs font-semibold text-red-600 tracking-wide pl-8">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

HonorCode.defaultProps = {
  errorMessage: '',
  onChangeHandler: null,
  fieldType: 'honor_code',
  value: false,
};

HonorCode.propTypes = {
  errorMessage: PropTypes.string,
  onChangeHandler: PropTypes.func,
  fieldType: PropTypes.string,
  value: PropTypes.bool,
};

export default HonorCode;
