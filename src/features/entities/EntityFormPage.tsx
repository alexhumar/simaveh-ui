import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  TextInput,
  Title,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import type { EntitySet } from '../../api/generated/entities';
import { NotFound } from '../../components/NotFound';
import { ApiErrorAlert, PageLoader } from '../../components/QueryState';
import {
  ENTITIES,
  displayEntity,
  entityPath,
  enumLabel,
  fieldLabel,
  keyOf,
  setOfEntity,
  type EntityDefinition,
} from '../../entities/registry';
import type { EntityKey, EntityRecord, FieldMeta, NavigationMeta } from '../../entities/types';
import { EntitySelect, type EntityRef } from './EntitySelect';
import { ReferenceAssignmentError, useEntity, useSaveEntity } from './hooks';
import { useEntityRoute } from './useEntityDefinition';

type FormValues = Record<string, unknown>;
type NavValues = Record<string, EntityRef | null>;

const REQUIRED = 'Campo obligatorio.';

/** Campos editables: la clave numerica la asigna la API; la de texto se carga solo en el alta. */
const editableFields = (definition: EntityDefinition, isEdit: boolean) =>
  definition.fields.filter((f) => f.name !== definition.key.name || (definition.key.kind === 'string' && !isEdit));

function fieldSchema(field: FieldMeta, isKey: boolean): z.ZodType {
  switch (field.kind) {
    case 'string': {
      if (isKey || !field.nullable) return z.string({ error: REQUIRED }).trim().min(1, REQUIRED);
      return z
        .string()
        .trim()
        .transform((v) => (v === '' ? null : v))
        .nullable();
    }
    case 'integer':
    case 'decimal': {
      let n = z.number({ error: REQUIRED });
      if (field.kind === 'integer') n = n.int('Debe ser un número entero.');
      if (field.min !== undefined) n = n.min(field.min, `Mínimo ${field.min}.`);
      if (field.max !== undefined) n = n.max(field.max, `Máximo ${field.max}.`);
      return field.nullable ? n.nullable() : n;
    }
    case 'boolean':
      return z.boolean();
    case 'enum': {
      const e = z.enum(field.enumValues as [string, ...string[]], { error: REQUIRED });
      return field.nullable ? e.nullable() : e;
    }
    case 'datetime':
      return field.nullable ? z.string().nullable() : z.string({ error: REQUIRED }).min(1, REQUIRED);
  }
}

function emptyValue(field: FieldMeta) {
  if (field.kind === 'boolean') return false;
  if (field.kind === 'string') return '';
  return null;
}

function toNavValues(navigations: NavigationMeta[], entity?: EntityRecord): NavValues {
  return Object.fromEntries(
    navigations.map((n) => {
      const related = entity?.[n.name] as EntityRecord | null | undefined;
      const set = related ? setOfEntity(related, n.targetSets) : undefined;
      return [
        n.name,
        related && set
          ? { set, key: keyOf(ENTITIES[set], related), label: displayEntity(related, n.targetType) }
          : null,
      ];
    }),
  );
}

export function EntityFormPage() {
  const { definition, key } = useEntityRoute();
  if (!definition) return <NotFound />;
  return <EntityForm key={`${definition.set}-${String(key)}`} definition={definition} entityKey={key} />;
}

const assignableNavigations = (definition: EntityDefinition) =>
  definition.navigations.filter((n) => !n.collection && n.canSet);

/** Carga la entidad (en edicion) y recien entonces monta el formulario con sus valores iniciales. */
function EntityForm({ definition, entityKey }: { definition: EntityDefinition; entityKey?: EntityKey }) {
  const navigations = assignableNavigations(definition);
  const entity = useEntity(definition.set, entityKey, {
    $expand: navigations.length ? navigations.map((n) => n.name) : undefined,
  });

  if (entityKey === undefined) return <EntityFormBody definition={definition} />;
  if (entity.isPending) return <PageLoader />;
  if (entity.error)
    return <ApiErrorAlert error={entity.error} title={`No se pudo cargar ${definition.singular.toLowerCase()}`} />;
  return <EntityFormBody definition={definition} entityKey={entityKey} entity={entity.data} />;
}

function EntityFormBody({
  definition,
  entityKey,
  entity,
}: {
  definition: EntityDefinition;
  entityKey?: EntityKey;
  entity?: EntityRecord;
}) {
  const isEdit = entityKey !== undefined;
  const navigate = useNavigate();
  const fields = editableFields(definition, isEdit);
  const navigations = assignableNavigations(definition);

  const schema = useMemo(
    () => z.object(Object.fromEntries(fields.map((f) => [f.name, fieldSchema(f, f.name === definition.key.name)]))),
    [fields, definition.key.name],
  );
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: Object.fromEntries(fields.map((f) => [f.name, entity?.[f.name] ?? emptyValue(f)])),
  });
  const [initialNavs] = useState<NavValues>(() => toNavValues(navigations, entity));
  const [navValues, setNavValues] = useState<NavValues>(initialNavs);

  const save = useSaveEntity(definition.set);
  const detailPath = (key: EntityKey) => entityPath(definition.set, key);

  const onSubmit = form.handleSubmit((values) => {
    const references = navigations
      .map((n) => ({ navigation: n.name, value: navValues[n.name], initial: initialNavs[n.name] }))
      .filter(({ value, initial }) => value && (value.set !== initial?.set || value.key !== initial?.key))
      .map(({ navigation, value }) => ({ navigation, targetSet: value!.set, targetKey: value!.key }));

    save.mutate(
      { key: entityKey, data: values, references },
      {
        onSuccess: (savedKey) => {
          notifications.show({
            color: 'green',
            message: `${definition.singular} ${isEdit ? 'actualizad' : 'cread'}${definition.femenino ? 'a' : 'o'}.`,
          });
          navigate(detailPath(savedKey));
        },
        onError: (error) => {
          // Alta guardada pero con relaciones pendientes: seguir en la edicion del registro creado.
          if (error instanceof ReferenceAssignmentError && !isEdit) {
            notifications.show({
              color: 'yellow',
              title: `${definition.singular} guardad${definition.femenino ? 'a' : 'o'}`,
              message: `No se pudo asignar: ${error.failed.map((f) => fieldLabel(f.navigation)).join(', ')}.`,
            });
            navigate(`${detailPath(error.key)}/editar`, { replace: true });
          }
        },
      },
    );
  });

  const title = isEdit
    ? `Editar ${definition.singular.toLowerCase()}`
    : `${definition.femenino ? 'Nueva' : 'Nuevo'} ${definition.singular.toLowerCase()}`;
  const saveError = save.error instanceof ReferenceAssignmentError ? save.error.failed[0]?.error : save.error;

  return (
    <Stack maw={860}>
      <Title order={2}>{title}</Title>
      <Card withBorder component="form" onSubmit={onSubmit} noValidate>
        <Stack>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {fields.map((f) => (
              <FieldInput key={f.name} field={f} control={form.control} isKey={f.name === definition.key.name} />
            ))}
            {navigations.map((n) => (
              <EntitySelect
                key={n.name}
                label={fieldLabel(n.name)}
                sets={n.targetSets as EntitySet[]}
                value={navValues[n.name]}
                onChange={(value) => setNavValues((v) => ({ ...v, [n.name]: value }))}
                // La API no permite quitar una relacion simple ya asignada (no hay DELETE $ref).
                clearable={!initialNavs[n.name]}
              />
            ))}
          </SimpleGrid>

          {save.error instanceof ReferenceAssignmentError && (
            <Alert color="yellow" title="Relaciones sin asignar">
              Los datos se guardaron, pero no se pudo asignar:{' '}
              {save.error.failed.map((f) => fieldLabel(f.navigation)).join(', ')}. Revisá y volvé a guardar.
            </Alert>
          )}
          {saveError != null && <ApiErrorAlert error={saveError} title="No se pudo guardar" />}

          <Group justify="flex-end">
            <Button variant="default" component={Link} to={isEdit ? detailPath(entityKey) : entityPath(definition.set)}>
              Cancelar
            </Button>
            <Button type="submit" loading={save.isPending}>
              Guardar
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}

function FieldInput({
  field,
  control,
  isKey,
}: {
  field: FieldMeta;
  control: ReturnType<typeof useForm<FormValues>>['control'];
  isKey: boolean;
}) {
  const label = fieldLabel(field.name);
  const required = isKey || (!field.nullable && field.kind !== 'boolean');

  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: input, fieldState }) => {
        const error = fieldState.error?.message;
        switch (field.kind) {
          case 'boolean':
            return (
              <Switch
                label={label}
                checked={!!input.value}
                onChange={(e) => input.onChange(e.currentTarget.checked)}
                mt="xl"
              />
            );
          case 'integer':
          case 'decimal':
            return (
              <NumberInput
                label={label}
                withAsterisk={required}
                value={(input.value as number | null) ?? ''}
                onChange={(v) => input.onChange(v === '' ? null : Number(v))}
                onBlur={input.onBlur}
                allowDecimal={field.kind === 'decimal'}
                decimalSeparator=","
                thousandSeparator="."
                min={field.min}
                max={field.max}
                error={error}
              />
            );
          case 'enum':
            return (
              <Select
                label={label}
                withAsterisk={required}
                data={(field.enumValues ?? []).map((v) => ({ value: v, label: enumLabel(v) }))}
                value={(input.value as string | null) ?? null}
                onChange={input.onChange}
                clearable={field.nullable}
                error={error}
              />
            );
          case 'datetime':
            return (
              <DateTimePicker
                label={label}
                withAsterisk={required}
                value={input.value ? dayjs(String(input.value)).format('YYYY-MM-DD HH:mm:ss') : null}
                // La API espera ISO 8601 con zona horaria (ej. 2026-11-27T19:00:00-03:00).
                onChange={(v) => input.onChange(v ? dayjs(v).format() : null)}
                valueFormat="DD/MM/YYYY HH:mm"
                clearable={field.nullable}
                error={error}
              />
            );
          default:
            return (
              <TextInput
                label={label}
                withAsterisk={required}
                value={(input.value as string | null) ?? ''}
                onChange={input.onChange}
                onBlur={input.onBlur}
                error={error}
              />
            );
        }
      }}
    />
  );
}
