import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { rulesUrl, rulesSectionLabel, type RulesSection } from './rulesLinks';

interface RuleLinkProps {
  /** The rules section to link to. */
  section: RulesSection;
  /** Optional override for the displayed label. Defaults to section name. */
  label?: string;
  /** When true, renders as a block-level link with icon. */
  block?: boolean;
}

/**
 * Reusable link to a section of the Rules reference page.
 * Use throughout the site for quick cross-reference.
 *
 * @example
 *   <RuleLink section="working-verbs" />
 *   <RuleLink section="drift" label="Scene Drift rules" />
 */
export function RuleLink({ section, label, block }: RuleLinkProps) {
  const displayLabel = label ?? rulesSectionLabel(section);
  const url = rulesUrl(section);

  if (block) {
    return (
      <Link
        to={url}
        className="rule-link rule-link--block"
      >
        <BookOpen size={16} />
        <span>{displayLabel}</span>
      </Link>
    );
  }

  return (
    <Link to={url} className="rule-link">
      {displayLabel}
    </Link>
  );
}
