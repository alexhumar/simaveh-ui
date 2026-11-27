import { Card, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useListMarca } from '../../api/generated/endpoints/marcas/marcas';
import { ApiErrorAlert } from '../../components/QueryState';

export function InicioPage() {
  // $top=0 + $count=true: solo trae el total.
  const marcas = useListMarca({ $top: 0, $count: true });

  return (
    <Stack>
      <Title order={2}>Inicio</Title>
      {marcas.error && <ApiErrorAlert error={marcas.error} title="No se pudo conectar con la API" />}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
        <Card withBorder component={Link} to="/marcas">
          <Text size="sm" c="dimmed">
            Marcas
          </Text>
          <Text size="xl" fw={700}>
            {marcas.data?.['@odata.count'] ?? '—'}
          </Text>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
