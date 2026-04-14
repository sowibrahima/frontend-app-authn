import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import messages from '../../messages';

const TermsOfService = (props) => {
  const { formatMessage } = useIntl();
  const {
    errorMessage, onChangeHandler, value,
  } = props;

  return (
    <div id="terms-of-service" className="text-sm text-neutral-500 my-4">
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex items-start pt-0.5">
          <input
            type="checkbox"
            id="tos"
            checked={value}
            name="terms_of_service"
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
            id="register.page.terms.of.service"
            defaultMessage="I agree to the {platformName}&nbsp;{termsOfService}"
            description="Text that appears on registration form stating terms of service.
                         It is a legal document that users must agree to."
            values={{
              platformName: getConfig().SITE_NAME,
              termsOfService: (
                <a
                  href={getConfig().TOS_LINK || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline font-medium"
                >
                  {formatMessage(messages['terms.of.service'])}
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

TermsOfService.defaultProps = {
  errorMessage: '',
  value: false,
};

TermsOfService.propTypes = {
  errorMessage: PropTypes.string,
  onChangeHandler: PropTypes.func.isRequired,
  value: PropTypes.bool,
};

export default TermsOfService;
