export type TimeFilterRule = "None" | "New" | "Update";
export type TextFilterRule = string;
export type CustomDomainFilterRule = boolean;
export type VerifiedFilterRule = boolean;

export type FilterRuleSet = {
  time: TimeFilterRule;
  text: TextFilterRule;
  customDomain: CustomDomainFilterRule;
  verified: VerifiedFilterRule;
};
