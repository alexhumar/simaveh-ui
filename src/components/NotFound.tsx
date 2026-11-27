import { Button, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <Stack align="center" py="xl">
      <Title order={2}>Pagina no encontrada</Title>
      <Text c="dimmed">La direccion no corresponde a ninguna seccion.</Text>
      <Button component={Link} to="/">
        Volver al inicio
      </Button>
    </Stack>
  );
}
