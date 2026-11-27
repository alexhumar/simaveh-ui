import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Group, Stack, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useCreateMarca, useGetMarca, useUpdateMarca } from '../../api/generated/endpoints/marcas/marcas';
import { ApiErrorAlert, PageLoader } from '../../components/QueryState';
import { invalidateEntitySet } from '../../lib/odata';

const marcaSchema = z.object({
  Nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
});
type MarcaForm = z.infer<typeof marcaSchema>;

/** Alta (`/marcas/nueva`) y edicion (`/marcas/:id/editar`). */
export function MarcaFormPage() {
  const params = useParams();
  const id = params.id ? Number(params.id) : undefined;
  const isEdit = id !== undefined;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const marca = useGetMarca(id ?? 0, undefined, { query: { enabled: isEdit } });
  const form = useForm<MarcaForm>({ resolver: zodResolver(marcaSchema), defaultValues: { Nombre: '' } });

  useEffect(() => {
    if (marca.data) form.reset({ Nombre: marca.data.Nombre ?? '' });
  }, [marca.data, form]);

  const onSaved = async (savedId: number | undefined, message: string) => {
    await invalidateEntitySet(queryClient, 'Marcas');
    notifications.show({ color: 'green', message });
    navigate(savedId ? `/marcas/${savedId}` : '/marcas');
  };
  const create = useCreateMarca({ mutation: { onSuccess: (m) => onSaved(m.Id, 'Marca creada.') } });
  const update = useUpdateMarca({ mutation: { onSuccess: () => onSaved(id, 'Marca actualizada.') } });
  const mutation = isEdit ? update : create;

  const onSubmit = form.handleSubmit((values) => {
    if (isEdit) update.mutate({ id, data: values });
    else create.mutate({ data: values });
  });

  if (isEdit && marca.isPending) return <PageLoader />;
  if (isEdit && marca.error) return <ApiErrorAlert error={marca.error} title="No se pudo cargar la marca" />;

  return (
    <Stack maw={560}>
      <Title order={2}>{isEdit ? 'Editar marca' : 'Nueva marca'}</Title>
      <Card withBorder component="form" onSubmit={onSubmit}>
        <Stack>
          <TextInput
            label="Nombre"
            withAsterisk
            autoFocus
            {...form.register('Nombre')}
            error={form.formState.errors.Nombre?.message}
          />
          {mutation.error && <ApiErrorAlert error={mutation.error} title="No se pudo guardar" />}
          <Group justify="flex-end">
            <Button variant="default" component={Link} to={isEdit ? `/marcas/${id}` : '/marcas'}>
              Cancelar
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              Guardar
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
