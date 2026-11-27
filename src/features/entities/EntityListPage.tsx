import { Button, Group, Pagination, Select, Stack, Table, Text, TextInput, Title, UnstyledButton } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { NotFound } from '../../components/NotFound';
import { ApiErrorAlert, PageLoader } from '../../components/QueryState';
import {
  defaultSortOf,
  displayEntity,
  entityPath,
  fieldLabel,
  formatValue,
  keyOf,
  searchFieldsOf,
  searchFilter,
  type EntityDefinition,
} from '../../entities/registry';
import type { EntityRecord } from '../../entities/types';
import { useEntityList } from './hooks';
import { useEntityRoute } from './useEntityDefinition';

const PAGE_SIZES = ['10', '25', '50', '100'];

interface Column {
  name: string;
  label: string;
  sortable: boolean;
  render: (entity: EntityRecord) => string;
}

function columnsOf(definition: EntityDefinition): Column[] {
  const fieldColumns: Column[] = definition.fields.map((f) => ({
    name: f.name,
    label: fieldLabel(f.name),
    sortable: true,
    render: (e) => formatValue(e[f.name], f),
  }));
  const navColumns: Column[] = definition.navigations
    .filter((n) => !n.collection)
    .map((n) => ({
      name: n.name,
      label: fieldLabel(n.name),
      sortable: false,
      render: (e) => displayEntity(e[n.name] as EntityRecord | null, n.targetType),
    }));
  // Id primero, luego campos y relaciones simples.
  const all = [...fieldColumns, ...navColumns].sort((a, b) => Number(b.name === 'Id') - Number(a.name === 'Id'));
  if (!definition.listColumns) return all;
  return definition.listColumns.map((name) => all.find((c) => c.name === name)).filter((c): c is Column => !!c);
}

export function EntityListPage() {
  const { definition } = useEntityRoute();
  if (!definition) return <NotFound />;
  // key: reinicia el estado (busqueda, orden) al cambiar de entidad desde el menu.
  return <EntityList key={definition.set} definition={definition} />;
}

function EntityList({ definition }: { definition: EntityDefinition }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('pagina') ?? 1);
  const search = searchParams.get('q') ?? '';
  const [searchInput, setSearchInput] = useState(search);
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);
  const [pageSize, setPageSize] = useState('25');
  const [sort, setSort] = useState({ field: defaultSortOf(definition), desc: false });

  if (debouncedSearch !== search) {
    setSearchParams(debouncedSearch ? { q: debouncedSearch } : {}, { replace: true });
  }

  const columns = columnsOf(definition);
  const expand = definition.navigations.filter((n) => !n.collection && columns.some((c) => c.name === n.name));
  const top = Number(pageSize);
  const { data, error, isPending, isFetching } = useEntityList(definition.set, {
    $top: top,
    $skip: (page - 1) * top,
    $count: true,
    $filter: searchFilter(definition, search),
    $orderby: [`${sort.field}${sort.desc ? ' desc' : ''}`],
    $expand: expand.length ? expand.map((n) => n.name) : undefined,
  });

  const total = data?.['@odata.count'] ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / top));
  const canSearch = searchFieldsOf(definition).length > 0 || definition.key.kind === 'number';

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('pagina', String(p));
    setSearchParams(next);
  };
  const toggleSort = (field: string) => setSort((s) => ({ field, desc: s.field === field ? !s.desc : false }));
  const sortIndicator = (field: string) => (sort.field === field ? (sort.desc ? ' ▼' : ' ▲') : '');

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>{definition.plural}</Title>
        <Button component={Link} to={`${entityPath(definition.set)}/nueva`}>
          {definition.femenino ? 'Nueva' : 'Nuevo'} {definition.singular.toLowerCase()}
        </Button>
      </Group>

      <Group>
        {canSearch && (
          <TextInput
            placeholder={searchFieldsOf(definition).length ? 'Buscar...' : 'Buscar por Id...'}
            value={searchInput}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
        )}
        <Select
          data={PAGE_SIZES}
          value={pageSize}
          onChange={(v) => {
            setPageSize(v ?? '25');
            setPage(1);
          }}
          w={90}
          ml="auto"
          aria-label="Filas por pagina"
          allowDeselect={false}
        />
      </Group>

      {error && <ApiErrorAlert error={error} title={`No se pudieron cargar ${definition.plural.toLowerCase()}`} />}
      {isPending ? (
        <PageLoader />
      ) : (
        <Table.ScrollContainer minWidth={600}>
          <Table striped highlightOnHover style={{ opacity: isFetching ? 0.6 : 1 }}>
            <Table.Thead>
              <Table.Tr>
                {columns.map((c) => (
                  <Table.Th key={c.name}>
                    {c.sortable ? (
                      <UnstyledButton fw={700} fz="sm" onClick={() => toggleSort(c.name)}>
                        {c.label}
                        {sortIndicator(c.name)}
                      </UnstyledButton>
                    ) : (
                      c.label
                    )}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.value?.map((entity) => {
                const key = keyOf(definition, entity);
                return (
                  <Table.Tr
                    key={String(key)}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(entityPath(definition.set, key))}
                  >
                    {columns.map((c) => (
                      <Table.Td key={c.name}>{c.render(entity)}</Table.Td>
                    ))}
                  </Table.Tr>
                );
              })}
              {data?.value?.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={columns.length}>
                    <Text c="dimmed" ta="center" py="md">
                      {search ? 'No hay resultados para la búsqueda.' : 'Todavía no hay registros.'}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}

      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {total} {total === 1 ? definition.singular.toLowerCase() : definition.plural.toLowerCase()}
        </Text>
        <Pagination total={totalPages} value={Math.min(page, totalPages)} onChange={setPage} />
      </Group>
    </Stack>
  );
}
