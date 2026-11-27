import { ActionIcon, Anchor, Button, Card, Group, Pagination, Stack, Table, Text, Title, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { EntitySet } from '../../api/generated/entities';
import { ApiErrorAlert } from '../../components/QueryState';
import { ENTITIES, displayEntity, entityPath, fieldLabel, keyOf, setOfEntity } from '../../entities/registry';
import type { EntityKey, NavigationMeta } from '../../entities/types';
import { getApiErrorMessages } from '../../lib/odata';
import { EntitySelect, type EntityRef } from './EntitySelect';
import { useCollectionReference, useNavigationCollection } from './hooks';

const PAGE_SIZE = 10;

interface RelationCollectionProps {
  set: EntitySet;
  entityKey: EntityKey;
  navigation: NavigationMeta;
}

/** Relacion de coleccion en el detalle: lista paginada con links, y agregar/quitar si la API lo permite. */
export function RelationCollection({ set, entityKey, navigation }: RelationCollectionProps) {
  const [page, setPage] = useState(1);
  const [toAdd, setToAdd] = useState<EntityRef | null>(null);
  const targetSets = navigation.targetSets as EntitySet[];
  const { data, error, isPending } = useNavigationCollection(set, entityKey, navigation.name, {
    $top: PAGE_SIZE,
    $skip: (page - 1) * PAGE_SIZE,
    $count: true,
  });
  const { add, remove } = useCollectionReference(set, entityKey, navigation.name);
  const total = data?.['@odata.count'] ?? 0;

  const onError = (error: unknown) =>
    notifications.show({
      color: 'red',
      title: 'No se pudo actualizar la relación',
      message: getApiErrorMessages(error).join(' '),
    });

  const items = (data?.value ?? []).map((entity) => {
    const targetSet = setOfEntity(entity, targetSets);
    const key = targetSet ? keyOf(ENTITIES[targetSet], entity) : (entity.Id as EntityKey);
    return { entity, targetSet, key };
  });

  return (
    <Card withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Title order={4}>{fieldLabel(navigation.name)}</Title>
          <Text size="sm" c="dimmed">
            {total}
          </Text>
        </Group>

        {navigation.canAdd && (
          <Group align="flex-end" gap="xs">
            <div style={{ flex: 1 }}>
              <EntitySelect
                sets={targetSets}
                value={toAdd}
                onChange={setToAdd}
                placeholder="Buscar para agregar..."
                excludeKeys={items.map((i) => i.key)}
              />
            </div>
            <Button
              disabled={!toAdd}
              loading={add.isPending}
              onClick={() =>
                toAdd &&
                add.mutate({ targetSet: toAdd.set, targetKey: toAdd.key }, { onSuccess: () => setToAdd(null), onError })
              }
            >
              Agregar
            </Button>
          </Group>
        )}

        {error && <ApiErrorAlert error={error} />}
        {!isPending && items.length === 0 && (
          <Text size="sm" c="dimmed">
            Sin elementos.
          </Text>
        )}
        {items.length > 0 && (
          <Table>
            <Table.Tbody>
              {items.map(({ entity, targetSet, key }) => (
                <Table.Tr key={`${targetSet}-${String(key)}`}>
                  <Table.Td>
                    {targetSet ? (
                      <Anchor component={Link} to={entityPath(targetSet, key)}>
                        {displayEntity(entity, navigation.targetType)}
                      </Anchor>
                    ) : (
                      displayEntity(entity, navigation.targetType)
                    )}
                  </Table.Td>
                  {navigation.canRemove && targetSet && (
                    <Table.Td w={48}>
                      <Tooltip label="Quitar de la relación">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          aria-label="Quitar"
                          loading={remove.isPending && remove.variables?.targetKey === key}
                          onClick={() => remove.mutate({ targetSet, targetKey: key }, { onError })}
                        >
                          ✕
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
        {total > PAGE_SIZE && (
          <Pagination size="sm" total={Math.ceil(total / PAGE_SIZE)} value={page} onChange={setPage} />
        )}
      </Stack>
    </Card>
  );
}
