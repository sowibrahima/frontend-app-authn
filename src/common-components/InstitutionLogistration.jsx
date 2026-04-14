import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import messages from './messages';

/**
 * This component renders the Institution login button
 * */
export const RenderInstitutionButton = props => {
  const { onSubmitHandler, buttonTitle } = props;

  return (
    <button
      className="flex items-center justify-center gap-3 w-full py-2.5 px-4 mb-4 border border-[#dadce0] rounded-full bg-white hover:bg-[#f8f9fa] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:ring-offset-1 text-sm font-medium text-[#3c4043] font-sans"
      data-event-name="institution_login"
      onClick={onSubmitHandler}
      type="button"
    >
      <svg className="w-[18px] h-[18px] text-[#3c4043]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      {buttonTitle}
    </button>
  );
};

/**
 * This component renders the page list of available institutions for login
 * */
const InstitutionLogistration = props => {
  const lmsBaseUrl = getConfig().LMS_BASE_URL;
  const { formatMessage } = useIntl();
  const {
    secondaryProviders,
    headingTitle,
  } = props;

  return (
    <>
      <div className="flex justify-start mb-4 mt-2">
        <div className="flex flex-col">
          <h4 className="mb-2 font-bold text-neutral-900 text-lg">
            {headingTitle}
          </h4>
          <p className="mb-2 text-neutral-500">
            {formatMessage(messages['institution.login.page.sub.heading'])}
          </p>
        </div>
      </div>
      <div className="mb-5">
        <div className="w-full flex justify-start items-center p-3 rounded-lg hover:bg-neutral-100 transition-colors">
          <div className="w-full flex flex-col gap-2">
            {secondaryProviders.map(provider => (
              <div key={provider.name} className="py-2 border-b border-solid border-neutral-200 last:border-0">
                <a
                  className="text-brand hover:text-brand-burgundy underline decoration-brand/30 transition-colors font-medium block w-full text-left"
                  href={lmsBaseUrl + provider.loginUrl}
                >
                  {provider.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const LogistrationDefaultProps = {
  secondaryProviders: [],
  buttonTitle: '',
};
const LogistrationProps = {
  secondaryProviders: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    loginUrl: PropTypes.string.isRequired,
  })),
};

RenderInstitutionButton.propTypes = {
  ...LogistrationProps,
  buttonTitle: PropTypes.string,
  onSubmitHandler: PropTypes.func.isRequired,

};
RenderInstitutionButton.defaultProps = {
  ...LogistrationDefaultProps,
};

InstitutionLogistration.propTypes = {
  ...LogistrationProps,
  headingTitle: PropTypes.string,
};
InstitutionLogistration.defaultProps = {
  ...LogistrationDefaultProps,
  headingTitle: '',
};

export default InstitutionLogistration;
