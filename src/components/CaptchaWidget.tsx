import React from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useTheme } from '../contexts/ThemeContext';

interface CaptchaWidgetProps {
  onVerify: (token: string) => void;
  onExpire: () => void;
}

export const CaptchaWidget: React.FC<CaptchaWidgetProps> = ({ onVerify, onExpire }) => {
  const { darkMode } = useTheme();
  
  // Use VITE_TURNSTILE_SITE_KEY from environment or fallback to Cloudflare test site key
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  return (
    <div className="flex justify-center my-3 min-h-[65px] items-center">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onVerify}
        onExpire={onExpire}
        onError={onExpire}
        options={{
          theme: darkMode ? 'dark' : 'light',
          size: 'normal'
        }}
      />
    </div>
  );
};

export default CaptchaWidget;
