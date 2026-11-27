import { Button, Group, Pagination, Select, Stack, Table, Text, TextInput, Title, UnstyledButton } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { keepPreviousData } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useListMarca } from '../../api/generated/endpoints/marcas/marcas';
import { ApiErrorAlert, PageLoader } from '../../components/QueryState';
import { containsFilter } from '../../lib/odata';

const PAGE_SIZES = ['10', '25', '50', '100'];
type SortField = 'Id' | 'Nombre';

export function MarcasListPage() {
  const navigate = useNavigate();
  // Busqueda y pagina en la URL: se conservan al volver desde el detalle.
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('pagina') ?? 1);
  const search = searchParams.get('q') ?? '';
  const [searchInput, setSearchInput] = useState(search);
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);
  const [pageSize, setPageSize] = useState('25');
  const [sort, setSort] = useState<{ field: SortField; desc: boolean }>({ field: 'Nombre', desc: false });

  if (debouncedSearch !== search) {
    setSearchParams(debouncedSearch ? { q: debouncedSearch } : {}, { replace: true });
  }

  const top = Number(pageSize);
  const { data, error, isPending, isFetching } = useListMarca(
    {
      $top: top,
      $skip: (page - 1) * top,
      $count: true,
      $filter: containsFilter('Nombre', search),
      $orderby: [`${sort.field}${sort.desc ? ' desc' : ''}`],
    },
    { query: { placeholderData: keepPreviousData } },
  );

  const total = data?.['@odata.count'] ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / top));

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('pagina', String(p));
    setSearchParams(next);
  };
  const toggleSort = (field: SortField) => setSort((s) => ({ field, desc: s.field === field ? !s.desc : false }));
  const sortIndicator = (field: SortField) => (sort.field === field ? (sort.desc ? ' ▼' : ' ▲') : '');

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Marcas</Title>
        <Button component={Link} to="/marcas/nueva">
          Nueva marca
        </Button>
      </Group>

      <Group>
        <TextInput
          placeholder="Buscar por nombre..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          data={PAGE_SIZES}
          value={pageSize}
          onChange={(v) => {
            setPageSize(v ?? '25');
            setPage(1);
          }}
          w={90}
          aria-label="Filas por pagina"
          allowDeselect={false}
        />
      </Group>

      {error && <ApiErrorAlert error={error} title="No se pudieron cargar las marcas" />}
      {isPending ? (
        <PageLoader />
      ) : (
        <Table striped highlightOnHover style={{ opacity: isFetching ? 0.6 : 1 }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={100}>
                <UnstyledButton fw={700} onClick={() => toggleSort('Id')}>
                  Id{sortIndicator('Id')}
                </UnstyledButton>
              </Table.Th>
              <Table.Th>
                <UnstyledButton fw={700} onClick={() => toggleSort('Nombre')}>
                  Nombre{sortIndicator('Nombre')}
                </UnstyledButton>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data?.value?.map((marca) => (
              <Table.Tr key={marca.Id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/marcas/${marca.Id}`)}>
                <Table.Td>{marca.Id}</Table.Td>
                <Table.Td>{marca.Nombre}</Table.Td>
              </Table.Tr>
            ))}
            {data?.value?.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={2}>
                  <Text c="dimmed" ta="center" py="md">
                    No hay marcas que coincidan con la busqueda.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      )}

      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {total} marcas
        </Text>
        <Pagination total={totalPages} value={Math.min(page, totalPages)} onChange={setPage} />
      </Group>
    </Stack>
  );
}
