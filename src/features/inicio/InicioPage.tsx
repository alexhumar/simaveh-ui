import { Card, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import type { EntitySet } from '../../api/generated/entities';
import { ApiErrorAlert } from '../../components/QueryState';
import { ENTITIES, entityPath } from '../../entities/registry';
import { useEntityList } from '../entities/hooks';

const DESTACADAS: EntitySet[] = [
  'Automoviles',
  'Mantenimientos',
  'ServiciosReparadores',
  'Reparadores',
  'Repuestos',
  'Marcas',
];

export function InicioPage() {
  return (
    <Stack>
      <Title order={2}>Inicio</Title>
      <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }}>
        {DESTACADAS.map((set) => (
          <CountCard key={set} set={set} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

function CountCard({ set }: { set: EntitySet }) {
  // $top=0 + $count=true: solo el total.
  const { data, error } = useEntityList(set, { $top: 0, $count: true });
  if (error) return <ApiErrorAlert error={error} title={`No se pudo cargar ${ENTITIES[set].plural.toLowerCase()}`} />;
  return (
    <Card withBorder component={Link} to={entityPath(set)}>
      <Text size="sm" c="dimmed">
        {ENTITIES[set].plural}
      </Text>
      <Text size="xl" fw={700}>
        {data?.['@odata.count'] ?? '—'}
      </Text>
    </Card>
  );
}
