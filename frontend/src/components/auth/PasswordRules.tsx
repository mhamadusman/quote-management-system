import { memo } from 'react';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from '@mui/icons-material';

export interface PasswordRulesProps {
  password?: string;
}

const PasswordRulesComponent = (props: PasswordRulesProps) => {
  const pwd = props.password || '';

  const rules = [
    { label: '8+ characters', valid: pwd.length >= 8 },
    { label: '1 lowercase (a-z)', valid: /[a-z]/.test(pwd) },
    { label: '1 uppercase (A-Z)', valid: /[A-Z]/.test(pwd) },
    { label: '1 symbol (!@#$)', valid: /[^A-Za-z0-9]/.test(pwd) },
  ];

  return (
    <div className="password-rules-list">
      {rules.map((rule) => (
        <div key={rule.label} className={`password-rule-item ${rule.valid ? 'valid' : 'invalid'}`}>
          {rule.valid ? (
            <CheckCircleIcon sx={{ fontSize: '0.85rem', color: '#059669' }} />
          ) : (
            <UncheckedIcon sx={{ fontSize: '0.85rem', color: '#CBD5E1' }} />
          )}
          <span>{rule.label}</span>
        </div>
      ))}
    </div>
  );
};

export const PasswordRules = memo(PasswordRulesComponent);
