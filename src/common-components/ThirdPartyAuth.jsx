import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';

import messages from './messages';
import {
  ENTERPRISE_LOGIN_URL, LOGIN_PAGE, PENDING_STATE, REGISTER_PAGE,
} from '../data/constants';

import {
  RenderInstitutionButton,
  SocialAuthProviders,
} from './index';

/**
 * This component renders the Single sign-on (SSO) buttons for the providers passed.
 * */
const ThirdPartyAuth = (props) => {
  const { formatMessage } = useIntl();
  const {
    providers,
    secondaryProviders,
    currentProvider,
    handleInstitutionLogin,
    thirdPartyAuthApiStatus,
    isLoginPage,
  } = props;
  const isInstitutionAuthActive = !!secondaryProviders.length && !currentProvider;
  const isSocialAuthActive = !!providers.length && !currentProvider;
  const isEnterpriseLoginDisabled = getConfig().DISABLE_ENTERPRISE_LOGIN;
  const enterpriseLoginURL = getConfig().LMS_BASE_URL + ENTERPRISE_LOGIN_URL;
  const isThirdPartyAuthActive = isSocialAuthActive || (isEnterpriseLoginDisabled && isInstitutionAuthActive);

  return (
    <>
      {((isEnterpriseLoginDisabled && isInstitutionAuthActive) || isSocialAuthActive) && (
        <div className="mt-4 mb-3 font-bold text-neutral-900 text-sm">
          {isLoginPage
            ? formatMessage(messages['login.other.options.heading'])
            : formatMessage(messages['registration.other.options.heading'])}
        </div>
      )}
      {(isLoginPage && !isEnterpriseLoginDisabled && isSocialAuthActive) && (
        <a
          className={classNames(
            'flex items-center justify-center gap-3 w-full py-2.5 px-4 border border-[#dadce0] rounded-full bg-white hover:bg-[#f8f9fa] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:ring-offset-1 text-sm font-medium text-[#3c4043] font-sans',
            { 'mb-0': thirdPartyAuthApiStatus === PENDING_STATE },
            { 'mb-4': thirdPartyAuthApiStatus !== PENDING_STATE },
          )}
          href={enterpriseLoginURL}
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {formatMessage(messages['enterprise.login.btn.text'])}
        </a>
      )}

      {thirdPartyAuthApiStatus === PENDING_STATE && isThirdPartyAuthActive ? (
        <div className="mt-4">
          <Skeleton className="rounded-full" height={36} count={2} />
        </div>
      ) : (
        <>
          {(isEnterpriseLoginDisabled && isInstitutionAuthActive) && (
            <RenderInstitutionButton
              onSubmitHandler={handleInstitutionLogin}
              buttonTitle={formatMessage(messages['institution.login.button'])}
            />
          )}
          {isSocialAuthActive && (
            <div className="w-full space-y-3">
              <SocialAuthProviders
                socialAuthProviders={providers}
                referrer={isLoginPage ? LOGIN_PAGE : REGISTER_PAGE}
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

ThirdPartyAuth.defaultProps = {
  currentProvider: null,
  providers: [],
  secondaryProviders: [],
  thirdPartyAuthApiStatus: PENDING_STATE,
  isLoginPage: false,
};

ThirdPartyAuth.propTypes = {
  currentProvider: PropTypes.string,
  handleInstitutionLogin: PropTypes.func.isRequired,
  providers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      iconClass: PropTypes.string,
      iconImage: PropTypes.string,
      loginUrl: PropTypes.string,
      registerUrl: PropTypes.string,
    }),
  ),
  secondaryProviders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      iconClass: PropTypes.string,
      iconImage: PropTypes.string,
      loginUrl: PropTypes.string,
      registerUrl: PropTypes.string,
    }),
  ),
  thirdPartyAuthApiStatus: PropTypes.string,
  isLoginPage: PropTypes.bool,
};

export default ThirdPartyAuth;
