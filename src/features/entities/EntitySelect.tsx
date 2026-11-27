import { Group, Select, SegmentedControl, Stack, Text } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useState } from 'react';
import type { EntitySet } from '../../api/generated/entities';
import { ENTITIES, defaultSortOf, displayEntity, displayFieldsOf, keyOf, searchFilter } from '../../entities/registry';
import type { EntityKey } from '../../entities/types';
import { useEntityList } from './hooks';

export interface EntityRef {
  set: EntitySet;
  key: EntityKey;
  label: string;
}

interface EntitySelectProps {
  /** Sets candidatos (mas de uno para tipos abstractos, ej. Persona -> Reparadores | Usuarios). */
  sets: EntitySet[];
  value: EntityRef | null;
  onChange: (value: EntityRef | null) => void;
  label?: string;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  error?: string;
  /** Claves a excluir de las opciones (ej. elementos ya agregados a una coleccion). */
  excludeKeys?: EntityKey[];
}

/** Selector con busqueda remota sobre uno o varios entity sets. */
export function EntitySelect({
  sets,
  value,
  onChange,
  label,
  placeholder,
  clearable,
  disabled,
  error,
  excludeKeys,
}: EntitySelectProps) {
  const [set, setSet] = useState<EntitySet>(value?.set ?? sets[0]);
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 300);
  const definition = ENTITIES[set];
  const display = displayFieldsOf(definition.type, definition.fields).filter((n) =>
    definition.fields.some((f) => f.name === n),
  );

  // Mientras el texto coincide con la opcion elegida no se filtra (Select muestra el label en el input).
  const term = value && debounced === value.label ? '' : debounced;
  const { data, isFetching } = useEntityList(
    set,
    {
      $top: 20,
      $filter: searchFilter(definition, term),
      $orderby: [defaultSortOf(definition)],
      $select: [...new Set([definition.key.name, ...display])],
    },
    { enabled: !disabled },
  );

  const exclude = new Set((excludeKeys ?? []).map(String));
  const options = (data?.value ?? [])
    .filter((e) => !exclude.has(String(keyOf(definition, e))))
    .map((e) => ({ value: String(keyOf(definition, e)), label: displayEntity(e, definition.type) }));
  if (value && value.set === set && !options.some((o) => o.value === String(value.key))) {
    options.unshift({ value: String(value.key), label: value.label });
  }

  const select = (
    <Select
      label={sets.length > 1 ? undefined : label}
      placeholder={placeholder ?? 'Buscar...'}
      data={options}
      value={value && value.set === set ? String(value.key) : null}
      onChange={(selected, option) => {
        if (!selected) return onChange(null);
        const key: EntityKey = definition.key.kind === 'number' ? Number(selected) : selected;
        onChange({ set, key, label: option?.label ?? selected });
      }}
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      filter={({ options: all }) => all}
      nothingFoundMessage={isFetching ? 'Buscando...' : 'Sin resultados'}
      clearable={clearable}
      disabled={disabled}
      error={error}
      comboboxProps={{ withinPortal: true }}
    />
  );

  if (sets.length === 1) return select;
  return (
    <Stack gap={4}>
      {label && (
        <Text size="sm" fw={500}>
          {label}
        </Text>
      )}
      <Group gap="xs" align="flex-start" wrap="nowrap">
        <SegmentedControl
          size="xs"
          data={sets.map((s) => ({ value: s, label: ENTITIES[s].singular }))}
          value={set}
          onChange={(s) => {
            setSet(s as EntitySet);
            setSearch('');
          }}
          disabled={disabled}
        />
        <div style={{ flex: 1 }}>{select}</div>
      </Group>
    </Stack>
  );
}
