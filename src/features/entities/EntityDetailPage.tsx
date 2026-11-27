import { Anchor, Button, Card, Group, Modal, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Link, useNavigate } from 'react-router-dom';
import type { EntitySet } from '../../api/generated/entities';
import { NotFound } from '../../components/NotFound';
import { ApiErrorAlert, PageLoader } from '../../components/QueryState';
import {
  ENTITIES,
  displayEntity,
  entityPath,
  fieldLabel,
  formatValue,
  keyOf,
  setOfEntity,
  type EntityDefinition,
} from '../../entities/registry';
import type { EntityKey, EntityRecord } from '../../entities/types';
import { useDeleteEntity, useEntity } from './hooks';
import { RelationCollection } from './RelationCollection';
import { useEntityRoute } from './useEntityDefinition';

export function EntityDetailPage() {
  const { definition, key } = useEntityRoute();
  if (!definition || key === undefined) return <NotFound />;
  return <EntityDetail key={`${definition.set}-${String(key)}`} definition={definition} entityKey={key} />;
}

function EntityDetail({ definition, entityKey }: { definition: EntityDefinition; entityKey: EntityKey }) {
  const navigate = useNavigate();
  const [confirmOpened, confirm] = useDisclosure(false);
  const singleNavs = definition.navigations.filter((n) => !n.collection);
  const collections = definition.navigations.filter((n) => n.collection);

  const entity = useEntity(definition.set, entityKey, {
    $expand: singleNavs.length ? singleNavs.map((n) => n.name) : undefined,
  });
  const deleteEntity = useDeleteEntity(definition.set);

  if (entity.isPending) return <PageLoader />;
  if (entity.error)
    return <ApiErrorAlert error={entity.error} title={`No se pudo cargar ${definition.singular.toLowerCase()}`} />;

  const data = entity.data;
  const title = displayEntity(data, definition.type);
  const onDelete = () =>
    deleteEntity.mutate(entityKey, {
      onSuccess: () => {
        notifications.show({
          color: 'green',
          message: `${definition.singular} eliminad${definition.femenino ? 'a' : 'o'}.`,
        });
        navigate(entityPath(definition.set));
      },
    });

  return (
    <Stack maw={960}>
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="sm" c="dimmed">
            {definition.singular}
          </Text>
          <Title order={2}>{title}</Title>
        </div>
        <Group>
          <Button variant="default" component={Link} to={entityPath(definition.set)}>
            Volver
          </Button>
          <Button component={Link} to={`${entityPath(definition.set, entityKey)}/editar`}>
            Editar
          </Button>
          <Button color="red" variant="light" onClick={confirm.open}>
            Eliminar
          </Button>
        </Group>
      </Group>

      <Card withBorder>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {definition.fields.map((f) => (
            <div key={f.name}>
              <Text size="sm" c="dimmed">
                {fieldLabel(f.name)}
              </Text>
              <Text>{formatValue(data[f.name], f)}</Text>
            </div>
          ))}
          {singleNavs.map((n) => {
            const related = data[n.name] as EntityRecord | null | undefined;
            const relatedSet = related ? setOfEntity(related, n.targetSets) : undefined;
            return (
              <div key={n.name}>
                <Text size="sm" c="dimmed">
                  {fieldLabel(n.name)}
                </Text>
                {related && relatedSet ? (
                  <Anchor
                    component={Link}
                    to={entityPath(relatedSet, keyOf(ENTITIES[relatedSet as EntitySet], related))}
                  >
                    {displayEntity(related, n.targetType)}
                  </Anchor>
                ) : (
                  <Text>{displayEntity(related, n.targetType)}</Text>
                )}
              </div>
            );
          })}
        </SimpleGrid>
      </Card>

      {collections.length > 0 && (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {collections.map((n) => (
            <RelationCollection key={n.name} set={definition.set} entityKey={entityKey} navigation={n} />
          ))}
        </SimpleGrid>
      )}

      <Modal
        opened={confirmOpened}
        onClose={confirm.close}
        title={`Eliminar ${definition.singular.toLowerCase()}`}
        centered
      >
        <Stack>
          <Text>
            ¿Eliminar <b>{title}</b>? Esta acción no se puede deshacer.
          </Text>
          {deleteEntity.error && <ApiErrorAlert error={deleteEntity.error} />}
          <Group justify="flex-end">
            <Button variant="default" onClick={confirm.close}>
              Cancelar
            </Button>
            <Button color="red" loading={deleteEntity.isPending} onClick={onDelete}>
              Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
