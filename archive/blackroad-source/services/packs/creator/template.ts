import Handlebars from 'handlebars';

export const renderTemplate = <T extends object>(source: string, context: T): string => {
  // WARNING: 'noEscape: true' disables HTML escaping in Handlebars templates.
  // This is intentional for non-HTML contexts (e.g., JSON), but can lead to injection vulnerabilities
  // if used with untrusted user input. Ensure that 'context' is trusted and sanitized before use.
  const template = Handlebars.compile(source, { noEscape: true });
  return template(context);
};
