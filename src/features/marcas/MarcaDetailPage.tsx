import { Badge, Button, Card, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDeleteMarca, useGetMarca, useMarcasListCategorias } from '../../api/generated/endpoints/marcas/marcas';
import { ApiErrorAlert, PageLoader } from '../../components/QueryState';
import { invalidateEntitySet } from '../../lib/odata';

export function MarcaDetailPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmOpened, confirm] = useDisclosure(false);

  const marca = useGetMarca(id);
  const categorias = useMarcasListCategorias(id);
  const deleteMarca = useDeleteMarca({
    mutation: {
      onSuccess: async () => {
        await invalidateEntitySet(queryClient, 'Marcas');
        notifications.show({ color: 'green', message: 'Marca eliminada.' });
        navigate('/marcas');
      },
    },
  });

  if (marca.isPending) return <PageLoader />;
  if (marca.error) return <ApiErrorAlert error={marca.error} title="No se pudo cargar la marca" />;

  return (
    <Stack maw={720}>
      <Group justify="space-between">
        <Title order={2}>{marca.data.Nombre}</Title>
        <Group>
          <Button variant="default" component={Link} to="/marcas">
            Volver
          </Button>
          <Button component={Link} to={`/marcas/${id}/editar`}>
            Editar
          </Button>
          <Button color="red" variant="light" onClick={confirm.open}>
            Eliminar
          </Button>
        </Group>
      </Group>

      <Card withBorder>
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            Id
          </Text>
          <Text>{marca.data.Id}</Text>
          <Text size="sm" c="dimmed" mt="sm">
            Categorias
          </Text>
          {categorias.error ? (
            <ApiErrorAlert error={categorias.error} title="No se pudieron cargar las categorias" />
          ) : categorias.data?.value?.length ? (
            <Group gap="xs">
              {categorias.data.value.map((c) => (
                <Badge key={c.Id} variant="light">
                  {c.Nombre}
                </Badge>
              ))}
            </Group>
          ) : (
            <Text c="dimmed">{categorias.isPending ? 'Cargando...' : 'Sin categorias asignadas.'}</Text>
          )}
        </Stack>
      </Card>

      <Modal opened={confirmOpened} onClose={confirm.close} title="Eliminar marca" centered>
        <Stack>
          <Text>
            ¿Eliminar la marca <b>{marca.data.Nombre}</b>? Esta accion no se puede deshacer.
          </Text>
          {deleteMarca.error && <ApiErrorAlert error={deleteMarca.error} />}
          <Group justify="flex-end">
            <Button variant="default" onClick={confirm.close}>
              Cancelar
            </Button>
            <Button color="red" loading={deleteMarca.isPending} onClick={() => deleteMarca.mutate({ id })}>
              Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
