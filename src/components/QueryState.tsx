import { Alert, Center, Loader, List } from '@mantine/core';
import { getApiErrorMessages } from '../lib/odata';

export function PageLoader() {
  return (
    <Center py="xl">
      <Loader />
    </Center>
  );
}

export function ApiErrorAlert({
  error,
  title = 'No se pudo completar la operacion',
}: {
  error: unknown;
  title?: string;
}) {
  const messages = getApiErrorMessages(error);
  return (
    <Alert color="red" title={title} variant="light">
      {messages.length === 1 ? (
        messages[0]
      ) : (
        <List size="sm">
          {messages.map((m) => (
            <List.Item key={m}>{m}</List.Item>
          ))}
        </List>
      )}
    </Alert>
  );
}
