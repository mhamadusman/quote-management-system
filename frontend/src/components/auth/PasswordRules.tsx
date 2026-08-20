import { memo } from 'react';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from '@mui/icons-material';
import type { PasswordRulesProps } from '../../types';
import { PASSWORD_RULES_LABELS } from '../../constants';

const PasswordRulesComponent = (props: PasswordRulesProps) => {
  const pwd = props.password || '';

  const rules = [
    { label: PASSWORD_RULES_LABELS.MIN_LENGTH, valid: pwd.length >= 8 },
    { label: PASSWORD_RULES_LABELS.LOWERCASE, valid: /[a-z]/.test(pwd) },
    { label: PASSWORD_RULES_LABELS.UPPERCASE, valid: /[A-Z]/.test(pwd) },
    { label: PASSWORD_RULES_LABELS.SPECIAL_CHAR, valid: /[^A-Za-z0-9]/.test(pwd) },
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
