import { CombinedError } from 'urql';

export default function getValidationErrors<K extends string>(
  responseError: CombinedError | undefined,
  props: K[],
): Record<K, Record<string, string>> | null {
  const errors = responseError?.graphQLErrors[0].extensions?.exception?.validationErrors;
  if (!errors) {
    return null;
  }

  const mappedErrors = props.map((prop) => {
    const error = errors.find((e: any) => e.property.toLowerCase() === prop.toLowerCase());
    return [prop, error?.constraints];
  });

  return Object.fromEntries(mappedErrors) as Record<K, Record<string, string>>;
}
